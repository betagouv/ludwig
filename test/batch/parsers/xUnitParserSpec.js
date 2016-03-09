/*global describe it beforeEach*/
import {XUnitParser} from '../../../batch/parsers/xUnitParser';
import {assert} from 'chai';
import sinon from 'sinon';

describe('XUnit Parser', () => {
	let xUnitParser;

	beforeEach(()=> {
		xUnitParser = new XUnitParser();
	});

	it('should return null if file to parse is empty (no test suite)', () => {
		//setup
		sinon.stub(xUnitParser, 'readFile').yields(null, '<testsuite name="Mocha Tests" tests="28" failures="1" errors="1" skipped="0" timestamp="Tue, 08 Mar 2016 09:07:06 GMT" time="0.103"></testsuite>');
		const callback = sinon.spy();
		//action
		xUnitParser.parse('./filename.xunitreport', callback);
		//assert
		assert.equal(callback.calledOnce, true);
		assert.deepEqual(callback.getCall(0).args, [ null, null ]);
	});

	it('should return a testSuite with one ok test included in it if xUnitReport contains one test case', () => {
		//setup
		sinon.stub(xUnitParser, 'readFile').yields(null, '<testsuite name="Test Suite" tests="1" failures="0" errors="0" skipped="0" timestamp="Tue, 08 Mar 2016 09:07:06 GMT" time="0.103"><testcase classname="" name="Test Case" time="0.02"><randomElement>not a failure</randomElement></testcase></testsuite>');
		const callback = sinon.spy();
		//action
		xUnitParser.parse('./filename.xunitreport', callback);
		//assert
		assert.equal(callback.calledOnce, true);
		assert.equal(callback.getCall(0).args[0], null);
		assert.deepEqual(callback.getCall(0).args[1], {
			name: 'Test Suite',
			tests: 1,
			failures: 0,
			timestamp: 'Tue, 08 Mar 2016 09:07:06 GMT',
			testCases: [ {name: 'Test Case', status: 'ok', timestamp: 'Tue, 08 Mar 2016 09:07:06 GMT'} ]
		});
	});

	it('should return a testSuite with two ok tests included in it if xUnitReport contains two test cases', () => {
		//setup
		sinon.stub(xUnitParser, 'readFile').yields(null, '<testsuite name="Test Suite" tests="1" failures="0" errors="0" skipped="0" timestamp="Tue, 08 Mar 2016 09:07:06 GMT" time="0.103"><testcase classname="" name="Test Case" time="0.02"><randomElement>not a failure</randomElement></testcase><testcase classname="" name="Test Case 2" time="0.02"/></testsuite>');
		const callback = sinon.spy();
		//action
		xUnitParser.parse('./filename.xunitreport', callback);
		//assert
		assert.equal(callback.calledOnce, true);
		assert.equal(callback.getCall(0).args[0], null);
		assert.deepEqual(callback.getCall(0).args[1], {
			name: 'Test Suite',
			tests: 2,
			failures: 0,
			timestamp: 'Tue, 08 Mar 2016 09:07:06 GMT',
			testCases: [ {name: 'Test Case', status: 'ok', timestamp: 'Tue, 08 Mar 2016 09:07:06 GMT'},    {
				'name': 'Test Case 2',
				'status': 'ok',
				'timestamp': 'Tue, 08 Mar 2016 09:07:06 GMT'
			} ]
		});
	});

	it('should return a testSuite with one failed test included in it if xUnitReport contains one test case', () => {
		//setup
		sinon.stub(xUnitParser, 'readFile').yields(null, '<testsuite name="Test Suite" tests="1" failures="0" errors="0" skipped="0" timestamp="Tue, 08 Mar 2016 09:07:06 GMT" time="0.103"><testcase classname="" name="Test Case" time="0.02"><failure>some failure message</failure></testcase></testsuite>');
		const callback = sinon.spy();
		//action
		xUnitParser.parse('./filename.xunitreport', callback);
		//assert
		assert.equal(callback.calledOnce, true);
		assert.equal(callback.getCall(0).args[0], null);
		assert.deepEqual(callback.getCall(0).args[1], {
			name: 'Test Suite',
			tests: 1,
			failures: 1,
			timestamp: 'Tue, 08 Mar 2016 09:07:06 GMT',
			testCases: [ {name: 'Test Case', status: 'ko', timestamp: 'Tue, 08 Mar 2016 09:07:06 GMT', message:'some failure message'} ]
		});
	});

	it('should return an error if parser failed to read the file', () => {
		//setup
		sinon.stub(xUnitParser, 'readFile').yields(new Error('failed to read the file'));
		const callback = sinon.spy();
		//action
		xUnitParser.parse('./filename.xunitreport', callback);
		//assert
		assert.equal(callback.calledOnce, true);
		assert.deepEqual(callback.getCall(0).args[0], {message:'failed to read the file'});
	});

	it('should return null if xml data is invalid', () => {
		//setup
		sinon.stub(xUnitParser, 'readFile').yields(null, '<testsuite name="Test Suite" tamp="Tue, 08 Mar 2016 09:07:06 GMT" time="0.103"><testcase classname="" name="Test Case" time="0.02"</testsuite>');
		const callback = sinon.spy();
		//action
		xUnitParser.parse('./filename.xunitreport', callback);
		//assert
		assert.equal(callback.calledOnce, true);
		assert.deepEqual(callback.getCall(0).args[0], null);
	});
});
