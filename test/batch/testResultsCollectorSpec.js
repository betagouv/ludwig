/*global describe it beforeEach*/
import {assert} from 'chai';
import sinon from 'sinon';
import {TestResultsCollector} from '../../batch/testResultsCollector';

describe('testResultsCollector', () => {
	let testResultsCollector;
	beforeEach(() => {
		testResultsCollector = new TestResultsCollector({repo:'test/repo'});
		testResultsCollector.connect = () => {};//we don't want any db connection happening during those tests, so we might as well disable the connection part
	});
	describe('saveFromXUnitData', () => {
		it('should reject if file parsing failed', (done) => {
			//setup
			const context = {
				parser: {
					parseTestSuiteFromFile: sinon.stub().returns(Promise.reject({message: 'Could not parse xUnit file'}))
				},
				gitHelper: {init:sinon.stub().returns(Promise.resolve({}))}
			};
			//action
			testResultsCollector.saveFromXUnitData.call(context, 'file/path').then(() => {
				done(new Error('should reject w/ an error at that point'));
			}).catch((err) => {
				//assert
				assert.deepEqual(err, {message: 'Could not parse xUnit file'});
				done();
			});
		});

		it('should reject if testSuite save fails', (done) => {
			//setup
			const context = {
				parser: {
					parseTestSuiteFromFile: sinon.stub().returns(Promise.resolve({testCases: []}))
				},
				gitHelper: {
					getEarliestCommitAuthorForFile: sinon.stub().returns(Promise.resolve({some: 'data'})),
					init:sinon.stub().returns(Promise.resolve({}))
				},
				dao: {
					saveCompleteTestSuite: sinon.stub().returns(Promise.reject(new Error('some error')))
				}
			};

			//action
			testResultsCollector.saveFromXUnitData.call(context, 'file/path').then(() => {
				done(new Error('should reject w/ an error at that point'));
			}).catch((err) => {
				//assert
				assert.deepEqual(err.message, 'some error');
				done();
			});
		});

		it('should resolve with saved test suite data if all saves succeeded', (done) => {
			//setup
			const context = {
				parser: {
					parseTestSuiteFromFile: sinon.stub().returns(Promise.resolve({testCases: [ {} ]}))
				},
				gitHelper:{
					getEarliestCommitAuthorForFile: sinon.stub().returns(Promise.resolve({
						commit: {author: {foo: 'bar'}},
						author: {id: 1234}
					})),
					init:sinon.stub().returns(Promise.resolve({}))
				},
				dao: {saveCompleteTestSuite: sinon.stub().returns(Promise.resolve({some: 'data'}))}
			};
			//action
			testResultsCollector.saveFromXUnitData.call(context, 'file/path').then((data) => {
				//assert
				assert.deepEqual(data, {some: 'data'});
				done();
			}).catch((err) => {
				done(err);
			});
		});

		it('should resolve and add the test author to the right test case (match by file location) data before saving it', (done) => {
			//setup
			const saveCompleteTestSuiteStub = sinon.stub().returns(Promise.resolve({some: 'data'}));
			const context = {
				parser:{
					parseTestSuiteFromFile: sinon.stub().returns(Promise.resolve({testCases: [ {location: 'location1'}, {location: 'location2'} ]}))
				},
				gitHelper:{
					getEarliestCommitAuthorForFile: (location) => {
						if (location === 'location1') {
							return Promise.resolve({
								commit: {author: {name: 'author1', email: 'author1@mail.com'}},
								author: {id: 1233}
							});
						} else {
							return Promise.resolve({
								commit: {author: {name: 'author2', email: 'author2@mail.com'}},
								author: {id: 1234}
							});
						}
					},
					init:sinon.stub().returns(Promise.resolve({}))
				},
				dao:{saveCompleteTestSuite: saveCompleteTestSuiteStub}
			};

			//action
			testResultsCollector.saveFromXUnitData.call(context, 'file/path').then(() => {
				//assert
				assert.equal(saveCompleteTestSuiteStub.calledOnce, true);

				assert.equal(saveCompleteTestSuiteStub.getCall(0).args[0].testCases[0].location, 'location1');
				assert.deepEqual(saveCompleteTestSuiteStub.getCall(0).args[0].testCases[0].author, {
					name: 'author1',
					email: 'author1@mail.com'
				});
				assert.equal(saveCompleteTestSuiteStub.getCall(0).args[0].testCases[1].location, 'location2');
				assert.deepEqual(saveCompleteTestSuiteStub.getCall(0).args[0].testCases[1].author, {
					name: 'author2',
					email: 'author2@mail.com'
				});
				done();
			}).catch((err) => {
				done(err);
			});
		});
	});
});
