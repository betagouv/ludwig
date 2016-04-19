/*global describe it beforeEach*/
import {assert} from 'chai';
import sinon from 'sinon';
import {TestResultsCollector} from '../../batch/testResultsCollector';

describe('testResultsCollector', () => {
	let testResultsCollector;
	beforeEach(() => {
		testResultsCollector = new TestResultsCollector({});
		testResultsCollector.connect = () => {};//we don't want any db connection happening during those tests, so we might as well disable the connection part
	});
	describe('saveFromXUnitData', () => {
		it('should callback with an error if file parsing failed', (done) => {
			//setup
			sinon.stub(testResultsCollector, 'parser', {
				get: () => {
					return {
						parseTestSuiteFromFile:sinon.stub().returns(Promise.reject({message:'Could not parse xUnit file'}))
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
						parseTestSuiteFromFile:sinon.stub().returns(Promise.resolve({testCases:[]}))
					};
				}
			});
			sinon.stub(testResultsCollector, 'githubHelper', {
				get:() => {
					return {getFirstCommitForFile:sinon.stub().returns(Promise.resolve({some:'data'}))};
				}
			});
			sinon.stub(testResultsCollector, 'createNewTestSuite').returns({save:sinon.stub().yields({error:'some error'})});
			//action
			testResultsCollector.saveFromXUnitData('file/path', (err) => {
				//assert
				assert.deepEqual(err, {error:'some error'});
				done();
			});
		});

		it('should callback with an error if testCases for a testSuite save fails', (done) => {
			//setup
			sinon.stub(testResultsCollector, 'parser', {
				get: () => {
					return {
						parseTestSuiteFromFile:sinon.stub().returns(Promise.resolve({testCases:[]}))
					};
				}
			});
			sinon.stub(testResultsCollector, 'githubHelper', {
				get:() => {
					return {getFirstCommitForFile:sinon.stub().returns(Promise.resolve({some:'data'}))};
				}
			});
			sinon.stub(testResultsCollector, 'createNewTestSuite').returns({save:sinon.stub().yields(null)});
			sinon.stub(testResultsCollector, 'testCaseModel', {get: () => {
				return {collection:{insert:sinon.stub().yields({some:'error'})}};
			}});
			//action
			testResultsCollector.saveFromXUnitData('file/path', (err) => {
				//assert
				assert.deepEqual(err, {some:'error'});
				done();
			});
		});

		it('should callback with saved test suite data if all saves succeeded', (done) => {
			//setup
			sinon.stub(testResultsCollector, 'parser', {
				get: () => {
					return {
						parseTestSuiteFromFile:sinon.stub().returns(Promise.resolve({testCases:[]}))
					};
				}
			});
			sinon.stub(testResultsCollector, 'githubHelper', {
				get:() => {
					return {getFirstCommitForFile:sinon.stub().returns(Promise.resolve({some:'data'}))};
				}
			});
			sinon.stub(testResultsCollector, 'createNewTestSuite').returns({save:sinon.stub().yields(null, {some:'data'})});
			sinon.stub(testResultsCollector, 'testCaseModel', {get: () => {
				return {collection:{insert:sinon.stub().yields(null, {})}};
			}});
			//action
			testResultsCollector.saveFromXUnitData('file/path', (err, data) => {
				//assert
				assert.deepEqual(err, null);
				assert.deepEqual(data, {some:'data'});
				done();
			});
		});

		it('should not save the test suite if errors occurred while collecting author info', (done) => {
			//setup
			sinon.stub(testResultsCollector, 'parser', {
				get: () => {
					return {
						parseTestSuiteFromFile:sinon.stub().returns(Promise.resolve({testCases:[ {} ]}))
					};
				}
			});
			sinon.stub(testResultsCollector, 'githubHelper', {
				get:() => {
					return {getFirstCommitForFile:sinon.stub().returns(Promise.reject({error:'some error'}))};
				}
			});
			const testSuiteSave = sinon.stub().yields(null, {some:'data'});
			sinon.stub(testResultsCollector, 'createNewTestSuite').returns({save:testSuiteSave});

			//action
			testResultsCollector.saveFromXUnitData('file/path', (err) => {
				//assert
				assert.equal(testSuiteSave.called, false);
				assert.deepEqual(err, {error:'some error'});
				done();
			});
		});

		it('should save the test suite if no errors occurred while collecting author info', (done) => {
			//setup
			sinon.stub(testResultsCollector, 'parser', {
				get: () => {
					return {
						parseTestSuiteFromFile:sinon.stub().returns(Promise.resolve({testCases:[ {} ]}))
					};
				}
			});
			sinon.stub(testResultsCollector, 'githubHelper', {
				get:() => {
					return {getFirstCommitForFile:sinon.stub().returns(Promise.resolve({commit:{author:{foo:'bar'}}, author:{id:1234}}))};
				}
			});
			const testSuiteSave = sinon.stub().yields(null, {some:'data'});
			sinon.stub(testResultsCollector, 'createNewTestSuite').returns({save:testSuiteSave});
			sinon.stub(testResultsCollector, 'testCaseModel', {get: () => {
				return {collection:{insert:sinon.stub().yields(null, {})}};
			}});
			//action
			testResultsCollector.saveFromXUnitData('file/path', () => {
				//assert
				assert.equal(testSuiteSave.called, true);
				done();
			});
		});

		it('should add the test author to the right test case (match by file location) data before saving it', (done) => {
			//setup
			sinon.stub(testResultsCollector, 'parser', {
				get: () => {
					return {
						parseTestSuiteFromFile:sinon.stub().returns(Promise.resolve({testCases:[ {location:'location1'}, {location:'location2'}  ]}))
					};
				}
			});
			sinon.stub(testResultsCollector, 'githubHelper', {
				get:() => {
					return {getFirstCommitForFile:(location) => {
						if (location === 'location1') {
							return Promise.resolve({commit:{author:{name:'author1', email:'author1@mail.com'}}, author:{id:1233}});
						} else {
							return Promise.resolve({commit:{author:{name:'author2', email:'author2@mail.com'}}, author:{id:1234}});
						}
					}};
				}
			});

			const stubbedTestSuiteModel = {save: sinon.stub().yields(null, {})};
			sinon.stub(testResultsCollector, 'createNewTestSuite').returns(stubbedTestSuiteModel);
			sinon.stub(testResultsCollector, 'testCaseModel', {get: () => {
				return {collection:{insert: (testCases, callback) => { callback(null, {ops:testCases});}}};
			}});
			//action
			testResultsCollector.saveFromXUnitData('file/path', () => {
				//assert
				assert.equal(stubbedTestSuiteModel.save.calledTwice, true);

				assert.equal(stubbedTestSuiteModel.testCases[0].location, 'location1');
				assert.deepEqual(stubbedTestSuiteModel.testCases[0].author, {
					name: 'author1',
					email: 'author1@mail.com',
					githubId:1233
				});
				assert.equal(stubbedTestSuiteModel.testCases[1].location, 'location2');
				assert.deepEqual(stubbedTestSuiteModel.testCases[1].author, {
					name: 'author2',
					email: 'author2@mail.com',
					githubId:1234
				});
				done();
			});
		});
	});
});
