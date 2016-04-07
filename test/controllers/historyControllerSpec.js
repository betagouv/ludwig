/*global describe it beforeEach*/

import {HistoryController} from '../../controllers/historyController';
import {assert} from 'chai';
import sinon from 'sinon';

describe('HistoryController', () => {
	let historyController = null;
	beforeEach(() => {
		historyController = new HistoryController();
	});
	it('should callback w/ an error message if no name is specified', () => {
		//setup
		const callbackSpy = sinon.spy();
		//action
		historyController.collectTestHistoryDataForTest(null, callbackSpy);
		//assert
		assert.equal(callbackSpy.calledOnce, true);
		assert.deepEqual(callbackSpy.getCall(0).args, [ {message: 'No test name'} ]);
	});

	it('should callback with an empty test list and testLocation that is "N/A" if no history was found', () => {
		//setup
		const callbackSpy = sinon.spy();
		sinon.stub(historyController, 'getTestsService').returns({
			getTestHistoryByName: sinon.stub().yields(null, [ ])
		});
		//action
		historyController.collectTestHistoryDataForTest('some test name', callbackSpy);
		//assert
		assert.equal(callbackSpy.calledOnce, true);
		assert.deepEqual(callbackSpy.getCall(0).args, [ null, {
			testLocation: 'N/A',
			testList: [],
			testName: 'some test name'
		} ]);
	});

	it('should callback with actual test history if test exists', () => {
		//setup
		const callbackSpy = sinon.spy();
		sinon.stub(historyController, 'getTestsService').returns({
			getTestHistoryByName: sinon.stub().yields(null, [ {
				name: 'some test name',
				timestamp: 1,
				location: 'test location'
			} ])
		});
		//action
		historyController.collectTestHistoryDataForTest('some test name', callbackSpy);
		//assert
		assert.equal(callbackSpy.calledOnce, true);
		assert.deepEqual(callbackSpy.getCall(0).args, [ null, {
			testLocation: 'test location',
			testList: [ {'location': 'test location', name: 'some test name', timestamp: 1} ],
			testName: 'some test name'
		} ]);
	});
});
