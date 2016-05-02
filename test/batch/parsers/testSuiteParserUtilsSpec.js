/*global describe it*/
import {normalizeTime, testSuiteSummary, getFailureDataForSingleTest, getSystemOutputsForTest, tests, normalizeTestSuiteData} from '../../../batch/parsers/testSuiteParserUtils';
import {assert} from 'chai';

describe('xUnit parsed data decorator', () => {
	describe('normalizeTime', () => {
		it('should return 0 if there is no time data', () => {
			//setup
			//action
			const actual = normalizeTime(null);
			//assert
			assert.deepEqual(actual, '0.00');
		});

		it('should parse and return a fixed time value (2nd decimal point) if time is defined', () => {
			//setup
			//action
			const actual = normalizeTime('0.103');
			//assert
			assert.equal(actual, 0.1);
		});
	});

	describe('testSuiteSummary', () => {
		it('should return an object containing parsed tests, failures, errors and skipped data', () => {
			//setup
			//action
			const actual = testSuiteSummary({tests: '1', failures: '2', skipped: '3', errors: '4'});
			//assert
			assert.deepEqual(actual, {tests: 1, failures: 2, skipped: 3, errors: 4});
		});

		it('should return replace NaN by 0 if failures, tests, skipped or errors attributes cannot be parsed from raw data', () => {
			//setup
			//action
			const actual = testSuiteSummary({});
			//assert
			assert.equal(actual.failures, 0);
			assert.equal(actual.tests, 0);
			assert.equal(actual.skipped, 0);
			assert.equal(actual.errors, 0);
		});
	});

	describe('getFailureDataForSingleTest', () => {
		it('should return an object containing type, message and raw data', () => {
			//setup
			//action
			const actual = getFailureDataForSingleTest({$: {type: 'failureType', message: 'failureMessage'}, _: {some: 1}});
			//assert
			assert.deepEqual(actual, {type: 'failureType', message: 'failureMessage', raw: {some: 1}});
		});
	});

	describe('extras', () => {
		it('should return an object containing sys-output contents (such if node exists and is not an object)', () => {
			//setup
			//action
			const actual = getSystemOutputsForTest({'system-out': [ 'some output' ]});
			//assert
			assert.deepEqual(actual, {standart: 'some output'});
		});

		it('should return an object containing an empty sys-output value if the first output node encountered contains an object', () => {
			//setup
			//action
			const actual = getSystemOutputsForTest({'system-out': [ {some: 'output'} ]});
			//assert
			assert.deepEqual(actual, {standart: ''});
		});

		it('should return an object containing sys-error contents (such if node exists and is not an object)', () => {
			//setup
			//action
			const actual = getSystemOutputsForTest({'system-err': [ 'some error' ]});
			//assert
			assert.deepEqual(actual, {errors: 'some error'});
		});

		it('should return an object containing an empty sys-error value if the first error node encountered contains an object', () => {
			//setup
			//action
			const actual = getSystemOutputsForTest({'system-err': [ {some: 'error'} ]});
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
	describe('gatherTestSuiteData', () => {
		it('should return an empty object if raw data is not defined', () => {
			//setup
			//action
			const actual = normalizeTestSuiteData();
			//assert
			assert.deepEqual(actual, {});
		});

		it('should return gathered testSuite data if raw data contains testSuite data', () => {
			//setup

			//action
			const actual = normalizeTestSuiteData({testsuite:{$:{tests:1, failures:0, name:'Test Suite', timestamp:'Tue, 08 Mar 2016 09:07:06 GMT', time:'0.103'}, testcase:[ {$:{classname:'tests/test spec location', name:'Test Case', time:'0.02'}} ]}});
			//assert
			assert.deepEqual(actual, {
				suite: {
					name: 'Test Suite',
					outputs: {},
					summary: {
						errors: 0,
						failures: 0,
						skipped: 0,
						tests: 1
					},
					tests: [
						{
							classname: 'tests/test spec location',
							name: 'Test Case',
							time: '0.02'
						}
					],
					time: '0.10',
					timestamp: 1457428026000
				}
			});
		});
	});
});
