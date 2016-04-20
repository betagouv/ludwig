import {TestSuiteModel} from '../database/models/testSuiteModel';
import {TestCaseModel} from '../database/models/testCaseModel';

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

