/*global describe it beforeEach*/
import {XUnitParser} from '../../../batch/parsers/xUnitParser';
import {assert} from 'chai';
import sinon from 'sinon';

describe('XUnit Parser', () => {
	let xUnitParser;

	beforeEach(()=> {
		xUnitParser = new XUnitParser({
			repo:'user/repo',
			github:{
				branch:'master'
			}
		});
	});

	it('should return a resolved promise w/ null data if file to parse is empty (no test suite)', (done) => {
		//setup
		sinon.stub(xUnitParser, 'readFile').yields(null, '<testsuite name="Mocha Tests" tests="0" failures="0" errors="0" skipped="0" timestamp="Tue, 08 Mar 2016 09:07:06 GMT" time="0.103"></testsuite>');
		//action
		const parserPromise = xUnitParser.parse('./filename.xunitreport');
		//assert
		parserPromise.then((data) => {
			assert.equal(data, null);
			done();
		});
	});

	it('should return a resolved promise with a testSuite with one ok test included in it if xUnitReport contains one test case', (done) => {
		//setup
		sinon.stub(xUnitParser, 'readFile').yields(null, '<testsuite name="Test Suite" tests="1" failures="0" errors="0" skipped="0" timestamp="Tue, 08 Mar 2016 09:07:06 GMT" time="0.103"><testcase classname="tests/test spec location" name="Test Case" time="0.02"><randomElement>not a failure</randomElement></testcase><system-out></system-out><system-err></system-err></testsuite>');
		//action
		const parserPromise = xUnitParser.parse('./filename.xunitreport');
		//assert
		parserPromise.then((data) => {
			assert.deepEqual(data, {
				name: 'Test Suite',
				tests: 1,
				failures: 0,
				timestamp: '1457428026000',
				testCases: [ {
					url: 'https://github.com/user/repo/tree/master/tests/test spec location',
					location:'tests/test spec location',
					name: 'Test Case',
					status: 'ok',
					time: '0.02',
					timestamp: '1457428026000'
				} ]
			});

			done();
		});

	});

	it('should return a resolved promise w/ a testSuite with its "tests" property read form testsuite attributes', (done) => {
		//setup
		sinon.stub(xUnitParser, 'readFile').yields(null, '<testsuite name="Test Suite" tests="2" failures="0" errors="0" skipped="0" timestamp="Tue, 08 Mar 2016 09:07:06 GMT" time="0.103"><testcase classname="tests/" name="Test Case" time="0.02"><randomElement>not a failure</randomElement></testcase><testcase classname="tests/" name="Test Case 2" time="0.02"/><system-out></system-out><system-err></system-err></testsuite>');
		sinon.stub(xUnitParser, 'now', {
			get: () => {
				return 'Tue, 05 Apr 2016 09:16:33 GMT';
			}
		});
		//action
		const parserPromise = xUnitParser.parse('./filename.xunitreport');
		//assert
		parserPromise.then((data) => {
			assert.deepEqual(data, {
				name: 'Test Suite',
				tests: 2,
				failures: 0,
				timestamp: '1457428026000',
				testCases: [
					{
						url: 'https://github.com/user/repo/tree/master/tests/',
						location:'tests/',
						name: 'Test Case',
						status: 'ok',
						time: '0.02',
						timestamp: '1457428026000'
					}, {
						url: 'https://github.com/user/repo/tree/master/tests/',
						location:'tests/',
						name: 'Test Case 2',
						status: 'ok',
						time: '0.02',
						timestamp: '1457428026000'
					} ]
			});
			done();
		});

	});

	it('should return a resolved promise w/ the test suite timestamp set to the current date if no timestamp is found in the test suite', (done) => {
		//setup
		sinon.stub(xUnitParser, 'readFile').yields(null, '<testsuite name="Test Suite" tests="2" failures="0" errors="0" skipped="0" time="0.103"><testcase classname="" name="Test Case" time="0.02"><randomElement>not a failure</randomElement></testcase><testcase classname="" name="Test Case 2" time="0.02"/><system-out></system-out><system-err></system-err></testsuite>');
		sinon.stub(xUnitParser, 'now', {
			get: () => {
				const mockedDate = new Date();
				mockedDate.setTime(1459847793847);
				return mockedDate;
			}
		});
		//action
		const parserPromise = xUnitParser.parse('./filename.xunitreport');
		//assert
		parserPromise.then((data) => {
			assert.equal(data.timestamp, '1459847793847');
			done();
		});
	});

	it('should return a resolved promise w/ a testSuite with one failed test included in it if xUnitReport contains one test case, failures property must be read from testSuite attributes', (done) => {
		//setup
		sinon.stub(xUnitParser, 'readFile').yields(null, '<testsuite name="Test Suite" tests="1" failures="1" errors="0" skipped="0" timestamp="Tue, 08 Mar 2016 09:07:06 GMT" time="0.103"><testcase classname="tests/" name="Test Case" time="0.02"><failure type="failure" message="some failure message"></failure></testcase><system-out></system-out><system-err></system-err></testsuite>');
		//action
		const parserPromise = xUnitParser.parse('./filename.xunitreport');
		//assert
		parserPromise.then((data) => {
			assert.deepEqual(data, {
				name: 'Test Suite',
				tests: 1,
				failures: 1,
				timestamp: '1457428026000',
				testCases: [ {
					url: 'https://github.com/user/repo/tree/master/tests/',
					location:'tests/',
					name: 'Test Case',
					status: 'ko',
					time: '0.02',
					timestamp: '1457428026000',
					message: 'some failure message'
				} ]
			});
			done();
		});
	});

	it('should return a rejected promise if parser failed to read the file', (done) => {
		//setup
		sinon.stub(xUnitParser, 'readFile').yields(new Error('failed to read the file'));
		//action
		const parserPromise = xUnitParser.parse('./filename.xunitreport');
		//assert
		parserPromise.catch((message) => {
			assert.deepEqual(message, {message: 'failed to read the file'});
			done();
		});
	});

	it('should return an error if xml data is invalid', (done) => {
		//setup
		sinon.stub(xUnitParser, 'readFile').yields(null, '<testsuite name="Test Suite" tamp="Tue, 08 Mar 2016 09:07:06 GMT" time="0.103"><testcase classname="" name="Test Case" time="0.02"</testsuite>');
		//action
		const parserPromise = xUnitParser.parse('./filename.xunitreport');
		//assert
		parserPromise.catch((message) => {
			assert.deepEqual(message.message, 'Invalid attribute name\nLine: 0\nColumn: 131\nChar: <');
			done();
		});
	});

	it('should return a resolved promise with null if test suite does not exist', (done) => {
		//setup
		sinon.stub(xUnitParser, 'readFile').yields(null, '');
		//action
		const parserPromise = xUnitParser.parse('./filename.xunitreport');
		//assert
		parserPromise.then((data) => {
			assert.equal(data, null);
			done();
		});
	});
});
