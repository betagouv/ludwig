/*global describe it beforeEach*/

import {ListTestsController} from '../../controllers/listTestsController';
import {assert} from 'chai';
import sinon from 'sinon';

describe('ListTestsController', () => {
	let listTestsController = null;
	beforeEach(() => {
		listTestsController = new ListTestsController();
	});

	describe('showLastTestSuite',  () => {
		it('should callback w/ an error if getting most recent test suite raised an error', () => {
			//setup
			const callbackSpy = sinon.spy();
			sinon.stub(listTestsController, 'testsService', {
				get:() => {
					return {
						getMostRecentTestSuite:sinon.stub().yields({some:'error'})
					};
				}
			});
			//action
			listTestsController.showLatestTestSuite(null, callbackSpy);
			//assert
			assert.equal(callbackSpy.calledOnce, true);
			assert.deepEqual(callbackSpy.getCall(0).args, [ {some:'error'} ]);
		});

		it('should callback w/ an empty testSuite if getting most recent test suite returned nothing', () => {
			//setup
			const callbackSpy = sinon.spy();
			sinon.stub(listTestsController, 'testsService', {
				get:() => {
					return {
						getMostRecentTestSuite:sinon.stub().yields(null, null)
					};
				}
			});
			//action
			listTestsController.showLatestTestSuite(null, callbackSpy);
			//assert
			assert.equal(callbackSpy.calledOnce, true);
			assert.deepEqual(callbackSpy.getCall(0).args, [ null, {testSuite:null} ]);
		});

		it('should callback w/ a valid testSuite if getting most recent test suite returned something', () => {
			//setup
			const callbackSpy = sinon.spy();
			sinon.stub(listTestsController, 'testsService', {
				get:() => {
					return {
						getMostRecentTestSuite:sinon.stub().yields(null, {testCases:[], name:'foo bar baz', timestamp:0})
					};
				}
			});
			//action
			listTestsController.showLatestTestSuite(null, callbackSpy);
			//assert
			assert.equal(callbackSpy.calledOnce, true);
			assert.deepEqual(callbackSpy.getCall(0).args, [ null, {testSuite:{testCases:[], name:'foo bar baz', timestamp:0}, formattedTimestamp:'1970/01/01 à 01:00:00'} ]);
		});
	});

	describe('filterMine', () => {
		it('should return false if query filter does not equal "mine"', () => {
			//setup
			//action
			const actual = listTestsController.filterMine('hai');
			//assert
			assert.equal(actual, false);
		});
		it('should return true if passport data contains GitHUb id, and filter is "mine"', () => {
			//setup
			//action
			const actual = listTestsController.filterMine('mine', {user:{id:'1234'}});
			//assert
			assert.equal(actual, true);
		});
		it('should return false if passport data is null, even if filter is "mine"', () => {
			//setup
			//action
			const actual = listTestsController.filterMine('mine', null);
			//assert
			assert.equal(actual, false);
		});
	});
});

