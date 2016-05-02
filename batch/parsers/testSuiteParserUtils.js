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

export function tests(raw) {
	return _(raw).map(function (test) {
		var current = (test.failure || [])[0] || {$: {}, _: ''};

		return _({
			name: test.$.name,
			time: normalizeTime(test.$.time),
			classname: test.$.classname,
			failure: getFailureDataForSingleTest(current)
		}).tap(function (result) {
			if (!test.failure) {
				delete result.failure;
			}
		}).value();
	}).value();
}

export function getOutputs(raw) {
	const extras = {};
	if (raw['system-out']) {
		extras.output = (!_.isObject(raw['system-out'][0]) && raw['system-out'][0]) || '';
	}
	if (raw['system-err']) {
		extras.errors = (!_.isObject(raw['system-err'][0]) && raw['system-err'][0]) || '';
	}
	return extras;
}

export function gatherTestSuiteData(raw) {
	var testSuiteFromParsedData = (raw && raw.testsuite) ? raw.testsuite : null;
	if (!testSuiteFromParsedData) {
		return {};
	}
	var parsed = {
		name: testSuiteFromParsedData.$.name,
		time: normalizeTime(testSuiteFromParsedData.$.time),
		summary: testSuiteSummary(testSuiteFromParsedData.$),
		tests: tests(testSuiteFromParsedData.testcase),
		outputs: getOutputs(testSuiteFromParsedData),
		timestamp: testSuiteFromParsedData.$.timestamp ? Date.parse(testSuiteFromParsedData.$.timestamp) : new Date().getTime()
	};
	return {'suite': parsed};
}
