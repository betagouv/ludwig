import xml2jsPromise from 'xml-to-json-promise';
import {normalizeTestSuiteData, normalizeTime} from './testSuiteParserUtils';
const GITHUB_HOST = 'https://github.com/';

class XUnitParser {
	constructor(configuration) {
		this.configuration = configuration;
		this.xml2JSParser = xml2jsPromise;
	}

	parseSingleTestData(timestamp, testCaseXMLObject) {
		let testCase = {
			name: testCaseXMLObject.name,
			status: 'ok',
			timestamp: timestamp,
			url: `${GITHUB_HOST}${this.configuration.repo}/tree/${this.configuration.github.branch}/${testCaseXMLObject.classname}`,
			location: testCaseXMLObject.classname,
			time: normalizeTime(testCaseXMLObject.time)
		};

		if (testCaseXMLObject.failure) {
			testCase.status = 'ko';
			testCase.message = testCaseXMLObject.failure.message;
		}
		return testCase;
	}

	parseTestSuiteFromFile(xUnitFilePath) {
		return this.xml2JSParser.xmlFileToJSON(xUnitFilePath)
				.then((rawParsedData) => {
					if (!rawParsedData || rawParsedData.testsuite.$.tests == '0') {
						return null;
					}
					let testSuiteData = normalizeTestSuiteData(rawParsedData);
					if (testSuiteData.suite && testSuiteData.suite.tests) {
						const testCases = testSuiteData.suite.tests.map(this.parseSingleTestData.bind(this, testSuiteData.suite.timestamp));
						let testSuite = {
							name: testSuiteData.suite.name,
							tests: testSuiteData.suite.summary.tests,
							failures: testSuiteData.suite.summary.failures,
							timestamp: testSuiteData.suite.timestamp,
							testCases: testCases
						};
						return testSuite;
					}
				});
	}
}
export {XUnitParser};
