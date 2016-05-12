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

module.exports.getTestHistoryFilteredByName = function(userIdToFilterWith) {
	return new Promise( (resolve) => {
		TestSuiteModel.find({})
			.sort({timestamp: -1})
			.populate('testCases')
			.exec((err, data) => {
				const testSuite = data[0];
				if (userIdToFilterWith) {
					const filteredTests = testSuite.testCases.filter((testCase) => {
						return testCase.author.githubId === userIdToFilterWith;
					});
					testSuite.testCases = filteredTests;
				}
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
