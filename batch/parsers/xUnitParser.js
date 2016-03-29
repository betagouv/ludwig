import fs from 'fs';
import xml2js from 'xml2js';
import {from, time} from './parsed';

class XUnitParser {
	constructor(configuration) {
		this.configuration = configuration;
	}

	readFile(xUnitFilePath, callback) {
		fs.readFile(xUnitFilePath, function (err, data) {
			callback(err, data.toString());
		});
	}

	parseSingleTestData(testCaseXMLObject, parsedData) {
		let testCase = {
			name: testCaseXMLObject.name,
			status: 'ok',
			timestamp: `${parsedData.suite.timestamp}`,
			location:`${this.configuration.repoUrl}${this.configuration.acceptedTestsLocation}/${testCaseXMLObject.classname}`,
			time:time(testCaseXMLObject.time)
		};
		if(testCaseXMLObject.failure){
			testCase.status = 'ko';
			testCase.message = testCaseXMLObject.failure.message;
		}
		return testCase;
	}

	parse(xUnitFilePath, callback) {
		const self = this;
		this.readFile(xUnitFilePath, (err, data) => {
			if (!err) {
				xml2js.parseString(data, function (err, parsedData) {
					if(err) {
						callback(err);
					} else {
						if(parsedData.testsuite.$.tests !== '0'){
							parsedData = from(parsedData);
							parsedData.suite.timestamp = new Date(parsedData.suite.timestamp).getTime();
							if (parsedData.suite && parsedData.suite.tests) {
								const testCases = [];
								parsedData.suite.tests.forEach((testCaseXMLObject) => {
									var testCase = self.parseSingleTestData(testCaseXMLObject, parsedData);
									testCases.push(testCase);
								});
								let testSuite = {
									name: parsedData.suite.name,
									tests: parsedData.suite.summary.tests,
									failures: parsedData.suite.summary.failures,
									timestamp: `${parsedData.suite.timestamp}`,
									testCases: testCases
								};
								callback(null, testSuite);
							} else {
								callback(null, null);
							}
						} else {
							callback(null, null);
						}
					}
				});
			} else {
				callback({message: err.message});
			}
		});
	}
}
export {XUnitParser}
