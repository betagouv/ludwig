/*global describe it beforeEach*/
import {XUnitParser} from '../../../batch/parsers/xUnitParser';
import {assert} from 'chai';
import sinon from 'sinon';

describe('XUnit Parser', () => {
	let xUnitParser;

	beforeEach(()=> {
		xUnitParser = new XUnitParser({
			repoUrl: 'https://github.com/user/repo',
			acceptedTestsLocation: '/tree/master/tests'
		});
	});

	it('should return null if file to parse is empty (no test suite)', () => {
		//setup
		sinon.stub(xUnitParser, 'readFile').yields(null, '<testsuite name="Mocha Tests" tests="0" failures="0" errors="0" skipped="0" timestamp="Tue, 08 Mar 2016 09:07:06 GMT" time="0.103"></testsuite>');
		const callback = sinon.spy();
		//action
		xUnitParser.parse('./filename.xunitreport', callback);
		//assert
		assert.equal(callback.calledOnce, true);
		assert.deepEqual(callback.getCall(0).args, [ null, null ]);
	});

	it('should return a testSuite with one ok test included in it if xUnitReport contains one test case', () => {
		//setup
		sinon.stub(xUnitParser, 'readFile').yields(null, '<testsuite name="Test Suite" tests="1" failures="0" errors="0" skipped="0" timestamp="Tue, 08 Mar 2016 09:07:06 GMT" time="0.103"><testcase classname="test spec location" name="Test Case" time="0.02"><randomElement>not a failure</randomElement></testcase><system-out></system-out><system-err></system-err></testsuite>');
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
			timestamp: '1457428026000',
			testCases: [ {
				location: 'https://github.com/user/repo/tree/master/tests/test spec location',
				name: 'Test Case',
				status: 'ok',
				time: '0.02',
				timestamp: '1457428026000'
			} ]
		});
	});

	it('should return a testSuite with its "tests" property read form testsuite attributes', () => {
		//setup
		sinon.stub(xUnitParser, 'readFile').yields(null, '<testsuite name="Test Suite" tests="2" failures="0" errors="0" skipped="0" timestamp="Tue, 08 Mar 2016 09:07:06 GMT" time="0.103"><testcase classname="" name="Test Case" time="0.02"><randomElement>not a failure</randomElement></testcase><testcase classname="" name="Test Case 2" time="0.02"/><system-out></system-out><system-err></system-err></testsuite>');
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
			timestamp: '1457428026000',
			testCases: [
				{
					location: 'https://github.com/user/repo/tree/master/tests/',
					name: 'Test Case',
					status: 'ok',
					time: '0.02',
					timestamp: '1457428026000'
				}, {
					location: 'https://github.com/user/repo/tree/master/tests/',
					name: 'Test Case 2',
					status: 'ok',
					time: '0.02',
					timestamp: '1457428026000'
				} ]
		});
	});

	it('should return a testSuite with one failed test included in it if xUnitReport contains one test case, failures property must be read from testSuite attributes', () => {
		//setup
		sinon.stub(xUnitParser, 'readFile').yields(null, '<testsuite name="Test Suite" tests="1" failures="1" errors="0" skipped="0" timestamp="Tue, 08 Mar 2016 09:07:06 GMT" time="0.103"><testcase classname="" name="Test Case" time="0.02"><failure type="failure" message="some failure message"></failure></testcase><system-out></system-out><system-err></system-err></testsuite>');
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
			timestamp: '1457428026000',
			testCases: [ {
				location: 'https://github.com/user/repo/tree/master/tests/',
				name: 'Test Case',
				status: 'ko',
				time: '0.02',
				timestamp: '1457428026000',
				message: 'some failure message'
			} ]
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
		assert.deepEqual(callback.getCall(0).args[0], {message: 'failed to read the file'});
	});

	it('should return an error if xml data is invalid', () => {
		//setup
		sinon.stub(xUnitParser, 'readFile').yields(null, '<testsuite name="Test Suite" tamp="Tue, 08 Mar 2016 09:07:06 GMT" time="0.103"><testcase classname="" name="Test Case" time="0.02"</testsuite>');
		const callback = sinon.spy();
		//action
		xUnitParser.parse('./filename.xunitreport', callback);
		//assert
		assert.equal(callback.calledOnce, true);
		assert.deepEqual(callback.getCall(0).args[0].message, 'Invalid attribute name\nLine: 0\nColumn: 131\nChar: <');
	});
});
