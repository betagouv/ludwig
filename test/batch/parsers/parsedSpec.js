/*global describe it*/
import {time, summary, failure, extras, tests} from '../../../batch/parsers/parsed';
import {assert} from 'chai';

describe('xUnit parsed data decorator', () => {
	describe('time', () => {
		it('should return 0 if there is no time data', () => {
			//setup
			//action
			const actual = time(null);
			//assert
			assert.deepEqual(actual, '0.00');
		});

		it('should parse and return a fixed time value (2nd decimal point) if time is defined', () => {
			//setup
			//action
			const actual = time('0.103');
			//assert
			assert.equal(actual, 0.1);
		});
	});

	describe('summary', () => {
		it('should return an object containing parsed tests, failures, errors and skipped data', () => {
			//setup
			//action
			const actual = summary({tests: '1', failures: '2', skipped: '3', errors: '4'});
			//assert
			assert.deepEqual(actual, {tests: 1, failures: 2, skipped: 3, errors: 4});
		});
	});

	describe('failure', () => {
		it('should return an object containing type, message and raw data', () => {
			//setup
			//action
			const actual = failure({$: {type: 'failureType', message: 'failureMessage'}, _: {some: 1}});
			//assert
			assert.deepEqual(actual, {type: 'failureType', message: 'failureMessage', raw: {some: 1}});
		});
	});

	describe('extras', () => {
		it('should return an object containing sys-output contents (such if node exists and is not an object)', () => {
			//setup
			//action
			const actual = extras({'system-out': [ 'some output' ]});
			//assert
			assert.deepEqual(actual, {output: 'some output'});
		});

		it('should return an object containing an empty sys-output value if the first output node encountered contains an object', () => {
			//setup
			//action
			const actual = extras({'system-out': [ {some: 'output'} ]});
			//assert
			assert.deepEqual(actual, {output: ''});
		});

		it('should return an object containing sys-error contents (such if node exists and is not an object)', () => {
			//setup
			//action
			const actual = extras({'system-err': [ 'some error' ]});
			//assert
			assert.deepEqual(actual, {errors: 'some error'});
		});

		it('should return an object containing an empty sys-error value if the first error node encountered contains an object', () => {
			//setup
			//action
			const actual = extras({'system-err': [ {some: 'error'} ]});
			//assert
			assert.deepEqual(actual, {errors: ''});
		});
	});

	describe('tests', () => {
		it('should return an empty array if there are no testcases to be found', () => {
			//setup
			//action
			const actual = tests({});
			//assert
			assert.deepEqual(actual, [ ]);
		});

		it('should return exactly one test if there is only one testcase to analyze (testcase is a success)', () => {
			//setup
			const testCases = [ {$: {name: 'test name', time: '0.023', classname: 'class name'}} ];
			//action
			const actual = tests(testCases);
			//assert
			assert.deepEqual(actual, [ {
				'classname': 'class name',
				'name': 'test name',
				'time': '0.02'
			} ]);
		});

		it('should return exactly one test if there is only one testcase to analyze (testcase is an error)', () => {
			//setup
			const testCases = [ {
				$: {name: 'test name', time: '0.023', classname: 'class name'},
				failure: [ {$: {type: 'failure type', message: 'failure message'}, _: {raw: 'data'}} ]
			} ];
			//action
			const actual = tests(testCases);
			//assert
			assert.deepEqual(actual, [ {
				'classname': 'class name',
				'name': 'test name',
				'time': '0.02',
				'failure': {
					message: 'failure message',
					raw: {raw: 'data'},
					type: 'failure type'
				}
			} ]);
		});
	});
});
