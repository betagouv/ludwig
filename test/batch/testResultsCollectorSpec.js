/*global describe it beforeEach*/
import {assert} from 'chai';
import sinon from 'sinon';
import {TestResultsCollector} from '../../batch/testResultsCollector';

describe('testResultsCollector', () => {
	let testResultsCollector;
	beforeEach(() => {
		testResultsCollector = new TestResultsCollector();
		testResultsCollector.connect = () => {};//we don't want any db connection happening during those tests, so we might as well disable the connection part
	});
	describe('saveFromXUnitData', () => {
		it('should callback with an error if file parsing failed', (done) => {
			//setup
			sinon.stub(testResultsCollector, 'parser', {
				get: () => {
					return {
						parse:sinon.stub().returns(Promise.reject({message:'Could not parse xUnit file'}))
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

		it('should get github initial commit information for each test file if parsing was successful', () => {

		});
	});
});