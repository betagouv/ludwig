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

	describe('should return a resolved promise w/ null data if test suite data has issues', () => {
		it('test suite is empty (0 tests)', (done) => {
			//setup
			const context = {xml2JSParser:{xmlFileToJSON:sinon.stub().returns(Promise.resolve({testsuite:{$:{tests:0}}}))}};
			//action
			const parserPromise = xUnitParser.parseTestSuiteFromFile.call(context, './filename.xunitreport');
			//assert
			parserPromise.then((data) => {
				assert.equal(data, null);
				done();
			}).catch( (err) => {
				done(err);
			});
		});

		it('retrieved test suite data is null', (done) => {
			//setup
			const context = {xml2JSParser:{xmlFileToJSON:sinon.stub().returns(Promise.resolve(null))}};
			//action
			const parserPromise = xUnitParser.parseTestSuiteFromFile.call(context, './filename.xunitreport');
			//assert
			parserPromise.then((data) => {
				assert.equal(data, null);
				done();
			}).catch( (err) => {
				done(err);
			});
		});
	});

	describe('should return a resolved promise w/ testSuite data', () => {
		it('... with one ok test included in it if xUnitReport contains one test case', (done) => {
			//setup
			const context = {
				parseSingleTestData:xUnitParser.parseSingleTestData,
				configuration:{repo:'user/repo', github:{branch:'master'}},
				xml2JSParser:{xmlFileToJSON:sinon.stub().returns(Promise.resolve({testsuite:{$:{tests:1, failures:0, name:'Test Suite', timestamp:'Tue, 08 Mar 2016 09:07:06 GMT', time:'0.103'}, testcase:[ {$:{classname:'tests/test spec location', name:'Test Case', time:'0.02'}} ]}}))}
			};
			//action
			const parserPromise = xUnitParser.parseTestSuiteFromFile.call(context, './filename.xunitreport');
			//assert
			parserPromise.then((data) => {
				assert.deepEqual(data, {
					name: 'Test Suite',
					tests: 1,
					failures: 0,
					timestamp: 1457428026000,
					testCases: [ {
						url: 'https://github.com/user/repo/tree/master/tests/test spec location',
						location:'tests/test spec location',
						name: 'Test Case',
						status: 'ok',
						time: '0.02',
						timestamp: 1457428026000
					} ]
				});

				done();
			}).catch( (err) => {
				done(err);
			});

		});

		it('... with its "tests" property read form testsuite attributes', (done) => {
			//setup
			const context = {
				parseSingleTestData:xUnitParser.parseSingleTestData,
				configuration:{repo:'user/repo', github:{branch:'master'}},
				xml2JSParser:{xmlFileToJSON:sinon.stub().returns(Promise.resolve({testsuite:{$:{tests:2, failures:0, name:'Test Suite', timestamp:'Tue, 08 Mar 2016 09:07:06 GMT', time:'0.103'}, testcase:[ {$:{classname:'tests/', name:'Test Case', time:'0.02'}}, {$:{classname:'tests/', name:'Test Case 2', time:'0.02'}} ]}}))}
			};
			var clock = sinon.useFakeTimers(new Date('Tue, 05 Apr 2016 09:16:33 GMT').getTime());
			//action
			const parserPromise = xUnitParser.parseTestSuiteFromFile.call(context, './filename.xunitreport');
			//assert
			parserPromise.then((data) => {
				assert.deepEqual(data, {
					name: 'Test Suite',
					tests: 2,
					failures: 0,
					timestamp: 1457428026000,
					testCases: [
						{
							url: 'https://github.com/user/repo/tree/master/tests/',
							location:'tests/',
							name: 'Test Case',
							status: 'ok',
							time: '0.02',
							timestamp: 1457428026000
						}, {
							url: 'https://github.com/user/repo/tree/master/tests/',
							location:'tests/',
							name: 'Test Case 2',
							status: 'ok',
							time: '0.02',
							timestamp: 1457428026000
						} ]
				});
				clock.restore();
				done();
			}).catch( (err) => {
				clock.restore();
				done(err);
			});

		});

		it('... and test suite timestamp should beset to the current date if no timestamp was found', (done) => {
			//setup
			const context = {
				parseSingleTestData:xUnitParser.parseSingleTestData,
				configuration:{repo:'user/repo', github:{branch:'master'}},
				xml2JSParser:{xmlFileToJSON:sinon.stub().returns(Promise.resolve({testsuite:{$:{tests:2, failures:0, name:'Test Suite', time:'0.103'}, testcase:[ {$:{classname:'tests/', name:'Test Case', time:'0.02'}}, {$:{classname:'tests/', name:'Test Case 2', time:'0.02'}} ]}}))}
			};
			var clock = sinon.useFakeTimers(1459847793847);
			//action
			const parserPromise = xUnitParser.parseTestSuiteFromFile.call(context, './filename.xunitreport');
			//assert
			parserPromise.then((data) => {
				assert.equal(data.timestamp, 1459847793847);
				clock.restore();
				done();
			}).catch( (err) => {
				clock.restore();
				done(err);
			});
		});

		it('... with one failed test included in it if xUnitReport contains one test case, failures property must be read from testSuite attributes', (done) => {
			//setup
			const context = {
				parseSingleTestData:xUnitParser.parseSingleTestData,
				configuration:{repo:'user/repo', github:{branch:'master'}},
				xml2JSParser:{xmlFileToJSON:sinon.stub().returns(Promise.resolve({testsuite:{$:{tests:1, failures:1, name:'Test Suite', timestamp:'Tue, 08 Mar 2016 09:07:06 GMT', time:'0.103'}, testcase:[ {$:{classname:'tests/', name:'Test Case', time:'0.02'}, failure:[ {$:{type:'falure', message:'some failure message'}, _:{}} ]} ]}}))}
			};
			//action
			const parserPromise = xUnitParser.parseTestSuiteFromFile.call(context, './filename.xunitreport');
			//assert
			parserPromise.then((data) => {
				assert.deepEqual(data, {
					name: 'Test Suite',
					tests: 1,
					failures: 1,
					timestamp: 1457428026000,
					testCases: [ {
						url: 'https://github.com/user/repo/tree/master/tests/',
						location:'tests/',
						name: 'Test Case',
						status: 'ko',
						time: '0.02',
						timestamp: 1457428026000,
						message: 'some failure message'
					} ]
				});
				done();
			}).catch( (err) => {
				done(err);
			});
		});
	});

	it('should return a rejected promise if parser triggered an error while reading the file (before actually putting together the testSuite object)', (done) => {
		//setup
		const context = {
			parseSingleTestData:xUnitParser.parseSingleTestData,
			configuration:{repo:'user/repo', github:{branch:'master'}},
			xml2JSParser:{xmlFileToJSON:sinon.stub().returns(Promise.reject(new Error('failed to read the file')))}
		};
		//action
		const parserPromise = xUnitParser.parseTestSuiteFromFile.call(context, './filename.xunitreport');
		//assert
		parserPromise.catch((message) => {
			assert.equal(message.message, 'failed to read the file');
			done();
		});
	});
});
