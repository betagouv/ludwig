/*global describe it beforeEach*/

import {TestsService} from '../../services/testsService';
import {assert} from 'chai';
import sinon from 'sinon';

describe('TestsService', () => {
	let testsService = null;
	beforeEach(()=> {
		testsService = new TestsService();
	});
	it('should add the "formattedTimestamp" property to each testCase found in the database for a specific name', () => {
		//setup
		//action
		const actual = testsService.addFormattedTimestamps([ {timestamp: 0}, {timestamp: 20000} ]);
		//assert
		assert.deepEqual(actual, [
			{timestamp: 0, formattedTimestamp: '01/01/1970 à 01:00:00'}, {
				timestamp: 20000,
				formattedTimestamp: '01/01/1970 à 01:00:20'
			} ]);
	});

	describe('getMostRecentTestSuite', () => {
		let callbackSpy;
		const stubbedModel = {
			find: () => {
				const find = () => {
				};
				find.sort = () => {
					const sort = () => {
					};
					sort.populate = () => {
						const populate = () => {
						};
						populate.exec = (callback) => {
							callback(null, [ {testCases: [ {author: {githubId: 'foo'}}, {author: {githubId: 'bar'}} ] } ]);
						};
						return populate;
					};
					return sort;
				};
				return find;
			}
		};


		beforeEach( () => {
			callbackSpy = sinon.spy();
		});

		it('should not filter results if nameToFilterWith is empty', () => {
			//setup
			sinon.stub(testsService, 'testSuiteModel', {
				get: () => {
					return stubbedModel;
				}
			});
			//action
			testsService.getMostRecentTestSuite('', callbackSpy);
			//assert
			assert.equal(callbackSpy.calledOnce, true);
			assert.deepEqual(callbackSpy.getCall(0).args, [ null, {testCases: [ {author: {githubId: 'foo'}}, {author: {githubId: 'bar'}} ]} ]);
		});

		it('should not filter results if nameToFilterWith is null', () => {
			//setup
			sinon.stub(testsService, 'testSuiteModel', {
				get: () => {
					return stubbedModel;
				}
			});
			//action
			testsService.getMostRecentTestSuite(null, callbackSpy);
			//assert
			assert.equal(callbackSpy.calledOnce, true);
			assert.deepEqual(callbackSpy.getCall(0).args, [ null, {testCases: [ {author: {githubId: 'foo'}}, {author: {githubId: 'bar'}} ]} ]);
		});

		it('should only show testCases by "foo" if nameToFilterWith equals foo and there is a testCase where "foo" is an author', () => {
			//setup
			sinon.stub(testsService, 'testSuiteModel', {
				get: () => {
					return stubbedModel;
				}
			});
			//action
			testsService.getMostRecentTestSuite('foo', callbackSpy);
			//assert
			assert.equal(callbackSpy.calledOnce, true);
			assert.deepEqual(callbackSpy.getCall(0).args, [ null, {testCases: [ {author: {githubId: 'foo'}} ]} ]);
		});

		it('should return an empty test case list if nameToFilterWith equals foobar and there no testCase where "foobar" is an author', () => {
			//setup
			sinon.stub(testsService, 'testSuiteModel', {
				get: () => {
					return stubbedModel;
				}
			});
			//action
			testsService.getMostRecentTestSuite('foobar', callbackSpy);
			//assert
			assert.equal(callbackSpy.calledOnce, true);
			assert.deepEqual(callbackSpy.getCall(0).args, [ null, {testCases: [  ]} ]);
		});
	});

	describe('getTestHistoryByName', () => {
		const testCaseModel = {
			find: () => {
				const find = () => {
				};
				find.sort = () => {
					const sort = () => {
					};
					sort.exec = (callback) => {
						callback(null, [ {timestamp: 0} ]);
					};
					return sort;
				};
				return find;
			}
		};

		it('should enrich data using addFormattedTimestamps before returning', () => {
			//setup
			const callbackSpy = sinon.spy();
			const addFormattedTimestampsStub = sinon.stub();
			testsService.addFormattedTimestamps = addFormattedTimestampsStub;
			sinon.stub(testsService, 'testCaseModel').returns(testCaseModel);
			//action
			testsService.getTestHistoryByName('name', callbackSpy);
			//assert
			assert.equal(callbackSpy.calledOnce, true);
			assert.equal(addFormattedTimestampsStub.calledOnce, true);
		});
	});
});
