import mongoose from 'mongoose';
import {TestCaseModel} from '../models/testCaseModel';
import {TestSuiteModel} from '../models/testSuiteModel';

class TestsService {
	constructor (configuration) {
		mongoose.connect(configuration.uri, configuration.options);
	}

	getMostRecentTestSuite(callback) {
		TestSuiteModel.find({})
			.sort({timestamp:-1})
			.populate('testCases')
			.exec((err, data) => {
				callback(err, data[0]);
			});
	}
}

export {TestsService};
