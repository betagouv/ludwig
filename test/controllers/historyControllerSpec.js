/*global describe it*/

import HistoryController from '../../controllers/historyController';
import ludwigDAO from '../../database/ludwigDAO';
import {assert} from 'chai';
import sinon from 'sinon';

describe('HistoryController', () => {
	it('should callback w/ an error message if no name is specified', () => {
		//setup
		const callbackSpy = sinon.spy();
		//action
		HistoryController.collectTestHistoryDataForTest(null, callbackSpy);
		//assert
		assert.equal(callbackSpy.calledOnce, true);
		assert.deepEqual(callbackSpy.getCall(0).args, [ {message: 'No test name'} ]);
	});

	it('should callback with an empty test list and testLocation that is undefined if no history was found', () => {
		//setup
		sinon.stub(ludwigDAO, 'getTestHistoryByName').returns(Promise.resolve([ ]));
		//action
		HistoryController.collectTestHistoryDataForTest('some test name', (err, data) => {
			//assert
			assert.equal(err, null);
			assert.deepEqual(data, {
				testURL: undefined,
				testList: [],
				testName: 'some test name'
			});
		});
		ludwigDAO.getTestHistoryByName.restore();
	});

	it('should callback with actual test history if test exists', () => {
		//setup
		sinon.stub(ludwigDAO, 'getTestHistoryByName').returns(Promise.resolve({
			name: 'some test name',
			timestamp: 1,
			url: 'test location'
		}));

		//action
		HistoryController.collectTestHistoryDataForTest('some test name', (err, data) => {
			//assert
			assert.equal(err, null);
			assert.deepEqual(data, {
				testURL: 'test location',
				testList: [ {url: 'test location', name: 'some test name', timestamp: 1} ],
				testName: 'some test name'
			});

		});
		ludwigDAO.getTestHistoryByName.restore();
	});
});
