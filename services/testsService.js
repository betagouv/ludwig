import {TestCaseModel} from '../models/testCaseModel';
import {TestSuiteModel} from '../models/testSuiteModel';
import moment from 'moment';

class TestsService {
	constructor() {
	}

	getMostRecentTestSuite(callback) {
		TestSuiteModel.find({})
			.sort({timestamp: -1})
			.populate('testCases')
			.exec((err, data) => {
				callback(err, data[0]);
			});
	}

	getTestHistoryByName(testName, callback) {
		TestCaseModel.find({name: testName})
			.sort({timestamp: -1})
			.exec((err, data) => {
				data.forEach((testCase) => {
					const date = new Date();
					date.setTime(testCase.timestamp);
					testCase.formattedTimestamp =  moment(date).format('DD/MM/YYYY à hh:mm:ss');
				});
				callback(err, data);
			});
	};
}

export {TestsService};
