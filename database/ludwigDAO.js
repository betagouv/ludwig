import {TestSuiteModel} from '../database/models/testSuiteModel';
import {TestCaseModel} from '../database/models/testCaseModel';
import moment from 'moment';

module.exports.saveCompleteTestSuite = function(testSuiteData) {
	return new Promise( (resolve, reject) => {
		const testSuiteModel = new TestSuiteModel({
			name: testSuiteData.name,
			failures: testSuiteData.failures,
			timestamp: testSuiteData.timestamp
		});

		testSuiteModel.save( (err) => {
			if (err) {
				return reject(err);
			}
			TestCaseModel.collection.insert(testSuiteData.testCases, (err, testCases) => {
				if (err) {
					return reject(err);
				}
				testSuiteModel.testCases = testCases.ops;
				testSuiteModel.save((err, data) => {
					if (err) {
						return reject(err);
					}
					resolve(data);
				});
			});
		});
	});
};

module.exports.getTestHistoryFilteredByUserData = function(customUserFilter) {
	return new Promise( (resolve) => {
		TestSuiteModel.find({})
			.sort({timestamp: -1})
			.populate('testCases')
			.exec((err, data) => {
				const testSuite = data[0];
				const filteredTestCases = testSuite.testCases.filter((testCase) => {

					if (Object.keys(customUserFilter).length) {
						let includeTestCase = false;
						const filterMatches = [];

						filterMatches.push(customUserFilter.login && customUserFilter.login === testCase.author.name);
						filterMatches.push(customUserFilter.name && customUserFilter.name === testCase.author.name);
						filterMatches.push(customUserFilter.emails && customUserFilter.emails.indexOf(testCase.author.email) > -1);

						filterMatches.forEach((matchFound) => {
							includeTestCase |= matchFound;
						});
						return includeTestCase;
					} else {
						return true;
					}
				});
				testSuite.testCases = filteredTestCases;
				resolve(testSuite);
			});
	});
};

module.exports.getTestHistoryByName = function(testName) {
	return new Promise( (resolve) => {
		TestCaseModel.find({name: testName})
			.sort({timestamp: -1})
			.exec((err, data) => {
				const enrichedData = this.addFormattedTimestamps(data);
				resolve(enrichedData);
			});
	});
};

module.exports.addFormattedTimestamps = function(testCaseList) {
	testCaseList.forEach((testCase) => {
		const date = new Date();
		date.setTime(testCase.timestamp);
		testCase.formattedTimestamp = moment(date).format('DD/MM/YYYY à HH:mm:ss');
	});
	return testCaseList;
};
