var _ = require('lodash');

export function normalizeTime(rawTime) {
	let returnValue = 0;
	if (rawTime) {
		returnValue = Number.parseFloat(rawTime);
	}
	return returnValue.toFixed(2);
}

function parseIntOrZero(stringToParse) {
	return Number.parseInt(stringToParse) || 0;
}
export function testSuiteSummary(raw) {
	return {
		tests: parseIntOrZero(raw.tests),
		failures: parseIntOrZero(raw.failures),
		skipped: parseIntOrZero(raw.skipped),
		errors: parseIntOrZero(raw.errors)
	};
}

export function getFailureDataForSingleTest(raw) {
	return {
		type: raw.$.type,
		message: raw.$.message,
		raw: raw._
	};
}

export function tests(rawTestsList) {
	return rawTestsList.map( (test) => {
		let testFailureData = test.failure && test.failure[0];

		const testDataToMap = {
			name: test.$.name,
			time: normalizeTime(test.$.time),
			classname: test.$.classname
		};
		if (testFailureData) {
			testDataToMap.failure = getFailureDataForSingleTest(testFailureData);
		}

		return testDataToMap;
	});
}

export function getSystemOutputsForTest(rawTestData) {
	const systemOutput = {};
	if (rawTestData['system-out']) {
		systemOutput.standart = (!_.isObject(rawTestData['system-out'][0]) && rawTestData['system-out'][0]) || '';
	}
	if (rawTestData['system-err']) {
		systemOutput.errors = (!_.isObject(rawTestData['system-err'][0]) && rawTestData['system-err'][0]) || '';
	}
	return systemOutput;
}

export function normalizeTestSuiteData(raw) {
	var testSuiteFromParsedData = raw && raw.testsuite;
	if (!testSuiteFromParsedData) {
		return {};
	}
	var parsed = {
		name: testSuiteFromParsedData.$.name,
		time: normalizeTime(testSuiteFromParsedData.$.time),
		summary: testSuiteSummary(testSuiteFromParsedData.$),
		tests: tests(testSuiteFromParsedData.testcase),
		outputs: getSystemOutputsForTest(testSuiteFromParsedData),
		timestamp: testSuiteFromParsedData.$.timestamp ? Date.parse(testSuiteFromParsedData.$.timestamp) : new Date().getTime()
	};
	return {'suite': parsed};
}
