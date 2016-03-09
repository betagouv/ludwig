import fs from 'fs';
import xmlParser from 'xml-parser';

class XUnitParser {
	constructor() {
	}

	readFile(xUnitFilePath, callback) {
		fs.readFile(xUnitFilePath, function (err, data) {
			callback(err, data.toString());
		});
	}

	parseSingleTestData(testCaseXMLObject, parsedData, failuresCount) {
		let testCase = {
			name: testCaseXMLObject.attributes.name,
			status: 'ok',
			timestamp: parsedData.root.attributes.timestamp
		};
		if (testCaseXMLObject.children.length) {
			testCaseXMLObject.children.forEach((testCaseChild) => {
				if (testCaseChild.name === 'failure') {
					testCase.status = 'ko';
					testCase.message = testCaseXMLObject.children[0].content;
					failuresCount++;
				}
			});
		}
		return {testCase: testCase, failuresCount: failuresCount};
	}

	parseTestSuiteData(parsedData, failuresCount, testCases) {
		return {
			name: parsedData.root.attributes.name,
			tests: testCases.length,
			failures: failuresCount,
			timestamp: parsedData.root.attributes.timestamp,
			testCases: testCases
		};
	}

	parse(xUnitFilePath, callback) {
		const self = this;
		this.readFile(xUnitFilePath, function (err, data) {
			if (!err) {
				const parsedData = xmlParser(data);
				if (parsedData.root && parsedData.root.children.length) {
					const testCases = [];
					let failuresCount = 0;
					parsedData.root.children.forEach((testCaseXMLObject) => {
						if(testCaseXMLObject.name === 'testcase') {
							var __ret = self.parseSingleTestData(testCaseXMLObject, parsedData, failuresCount);
							var testCase = __ret.testCase;
							failuresCount = __ret.failuresCount;
							testCases.push(testCase);
						}
					});
					let testSuite = self.parseTestSuiteData(parsedData, failuresCount, testCases);
					callback(null, testSuite);
				} else {
					callback(null, null);
				}
			} else {
				callback({message: err.message});
			}
		});
	}
}
export {XUnitParser}