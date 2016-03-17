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

	describe('getTestHistoryByName', () => {
		const testCaseModel = {
			find: () => {
				const find = () => {
				};
				find.sort = () => {
					const sort = () => {};
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
