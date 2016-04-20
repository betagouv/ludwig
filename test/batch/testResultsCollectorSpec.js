/*global describe it beforeEach*/
import {assert} from 'chai';
import sinon from 'sinon';
import {TestResultsCollector} from '../../batch/testResultsCollector';

describe('testResultsCollector', () => {
	let testResultsCollector;
	beforeEach(() => {
		testResultsCollector = new TestResultsCollector({});
		testResultsCollector.connect = () => {
		};//we don't want any db connection happening during those tests, so we might as well disable the connection part
	});
	describe('saveFromXUnitData', () => {
		it('should callback with an error if file parsing failed', (done) => {
			//setup
			sinon.stub(testResultsCollector, 'parser', {
				get: () => {
					return {
						parseTestSuiteFromFile: sinon.stub().returns(Promise.reject({message: 'Could not parse xUnit file'}))
					};
				}
			});
			//action
			testResultsCollector.saveFromXUnitData('file/path', (err) => {
				//assert
				assert.deepEqual(err, {message: 'Could not parse xUnit file'});
				done();
			});
		});

		it('should callback with an error if testSuite save fails', (done) => {
			//setup
			sinon.stub(testResultsCollector, 'parser', {
				get: () => {
					return {
						parseTestSuiteFromFile: sinon.stub().returns(Promise.resolve({testCases: []}))
					};
				}
			});
			sinon.stub(testResultsCollector, 'githubHelper', {
				get: () => {
					return {getFirstCommitForFile: sinon.stub().returns(Promise.resolve({some: 'data'}))};
				}
			});
			sinon.stub(testResultsCollector, 'dao', {
				get: () => {
					return {saveCompleteTestSuite:sinon.stub().returns(Promise.reject(new Error('some error')))};
				}
			});
			//action
			testResultsCollector.saveFromXUnitData('file/path', (err) => {
				//assert
				assert.deepEqual(err.message, 'some error');
				done();
			});
		});

		it('should callback with saved test suite data if all saves succeeded', (done) => {
			//setup
			sinon.stub(testResultsCollector, 'parser', {
				get: () => {
					return {
						parseTestSuiteFromFile: sinon.stub().returns(Promise.resolve({testCases: [ {} ]}))
					};
				}
			});
			sinon.stub(testResultsCollector, 'githubHelper', {
				get: () => {
					return {getFirstCommitForFile: sinon.stub().returns(Promise.resolve({
						commit: {author: {foo: 'bar'}},
						author: {id: 1234}
					}))};
				}
			});
			sinon.stub(testResultsCollector, 'dao', {
				get: () => {
					return {saveCompleteTestSuite:sinon.stub().returns(Promise.resolve({some:'data'}))};
				}
			});
			//action
			testResultsCollector.saveFromXUnitData('file/path', (err, data) => {
				//assert
				assert.deepEqual(err, null);
				assert.deepEqual(data, {some: 'data'});
				done();
			});
		});

		it('should add the test author to the right test case (match by file location) data before saving it', (done) => {
			//setup
			sinon.stub(testResultsCollector, 'parser', {
				get: () => {
					return {
						parseTestSuiteFromFile: sinon.stub().returns(Promise.resolve({testCases: [ {location: 'location1'}, {location: 'location2'} ]}))
					};
				}
			});
			sinon.stub(testResultsCollector, 'githubHelper', {
				get: () => {
					return {
						getFirstCommitForFile: (location) => {
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
						}
					};
				}
			});

			const saveCompleteTestSuiteStub = sinon.stub().returns(Promise.resolve({some:'data'}));
			sinon.stub(testResultsCollector, 'dao', {
				get: () => {
					return {saveCompleteTestSuite:saveCompleteTestSuiteStub};
				}
			});

			//action
			testResultsCollector.saveFromXUnitData('file/path', () => {
				//assert
				assert.equal(saveCompleteTestSuiteStub.calledOnce, true);

				assert.equal(saveCompleteTestSuiteStub.getCall(0).args[0].testCases[0].location, 'location1');
				assert.deepEqual(saveCompleteTestSuiteStub.getCall(0).args[0].testCases[0].author, {
					name: 'author1',
					email: 'author1@mail.com',
					githubId: 1233
				});
				assert.equal(saveCompleteTestSuiteStub.getCall(0).args[0].testCases[1].location, 'location2');
				assert.deepEqual(saveCompleteTestSuiteStub.getCall(0).args[0].testCases[1].author, {
					name: 'author2',
					email: 'author2@mail.com',
					githubId: 1234
				});
				done();
			});
		});
	});
});
