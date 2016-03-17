var _ = require('lodash');

const time = (rawTime) => {
	let returnValue = 0;
	if (rawTime) {
		returnValue = Number.parseFloat(rawTime);
	}
	return returnValue.toFixed(2);
};


const summary = (raw) => {
	return {
		'tests': Number.parseInt(raw.tests),
		'failures': Number.parseInt(raw.failures),
		'skipped': Number.parseInt(raw.skipped),
		'errors': Number.parseInt(raw.errors)
	};
};

const failure = (raw) => {
	return {
		'type': raw.$.type,
		'message': raw.$.message,
		'raw': raw._
	};
};

const tests = (raw) => {
	return _(raw).map(function (test) {
		var current = (test.failure || [])[0] || {$: {}, _: ''};

		return _({
			'name': test.$.name,
			'time': time(test.$.time),
			'classname': test.$.classname,
			'failure': failure(current)
		}).tap(function (result) {
			!test.failure && delete result.failure;
		}).value();
	}).value();
};

const extras = (raw) => {
	const extras = {};
	if (raw['system-out']) {
		extras.output = (!_.isObject(raw['system-out'][0]) && raw['system-out'][0]) || '';
	}
	if (raw['system-err']) {
		extras.errors = (!_.isObject(raw['system-err'][0]) && raw['system-err'][0]) || '';

	}
	return extras;
};

const from = (raw) => {
	var testSuiteFromParsedData = raw.testsuite || {$: {}};
	var parsed = {
		'name': testSuiteFromParsedData.$.name,
		'time': time(testSuiteFromParsedData.$.time),
		'summary': summary(testSuiteFromParsedData.$),
		'tests': tests(testSuiteFromParsedData.testcase),
		'extras': extras(testSuiteFromParsedData),
		'timestamp': testSuiteFromParsedData.$.timestamp
	};
	return {'suite': parsed};
};

export {from, time, summary, failure, extras, tests};