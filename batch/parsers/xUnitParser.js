import fs from 'fs';
import xml2js from 'xml2js';
import {from} from './parsed';

class XUnitParser {
	constructor() {
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
			timestamp: parsedData.timestamp
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
						parsedData = from(parsedData);
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
								timestamp: parsedData.suite.timestamp,
								testCases: testCases
							};
							callback(null, testSuite);
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
