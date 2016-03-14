var _ = require('lodash');

function time(raw) {
	return +(+(raw || 0)).toFixed(2);
}

function summary(raw) {
	return {
		'tests': time(raw.tests),
		'failures': time(raw.failures),
		'skipped': time(raw.skipped),
		'errors': time(raw.errors)
	};
}

function failure(raw) {
	return {
		'type': raw.$.type,
		'message': raw.$.message,
		'raw': raw._
	};
}

function tests(raw) {
	return _(raw).map(function (test) {
		var current = (test.failure || [])[0] || { $: {}, _: '' };

		return _({
			'name': test.$.name,
			'time': time(test.$.time),
			'failure': failure(current)
		}).tap(function (result) { !test.failure && delete result.failure; }).value();
	}).value();
}

function extras(raw) {
	return {
		'output': (!_(raw['system-out'][0]).isObject() && raw['system-out'][0]) || '',
		'errors': (!_(raw['system-err'][0]).isObject() && raw['system-err'][0]) || ''
	};
}

function from(raw) {
	var rawSuite = raw.testsuite || { $: {} };

	var parsed = {
		'name': rawSuite.$.name,
		'time': time(rawSuite.$.time),
		'summary': summary(rawSuite.$),
		'tests': tests(rawSuite.testcase),
		'extras': extras(rawSuite),
		'timestamp':rawSuite.$.timestamp
	};

	return { 'suite': parsed };
}

exports.from = from;