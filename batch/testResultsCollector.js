import {XUnitParser} from './parsers/xUnitParser';
import mongoose from 'mongoose';
import {TestSuiteModel} from '../models/testSuiteModel';
import {TestCaseModel} from '../models/testCaseModel';


class TestResultsCollector {
	constructor(configuration) {
		this.options = configuration.mongo.options;
		this.mongoUri = configuration.mongo.uri;
		this.mongoConnection = mongoose.connect(this.mongoUri, this.options);
	}

	saveFromXUnitData(xUnitFilePath, callback) {
		const parser = new XUnitParser();
		parser.parse(xUnitFilePath, (errors, parsedTestSuiteData) => {
			let testSuite = new TestSuiteModel({
				name: parsedTestSuiteData.name,
				failures: parsedTestSuiteData.failures,
				timestamp: new Date(parsedTestSuiteData.timestamp).getTime()
			});

			testSuite.save((err, testSuiteSavedData) => {
				if(!err) {
					TestCaseModel.collection.insert(parsedTestSuiteData.testCases, (err, testCases) => {
						if (!err) {
							testSuite.testCases = testCases.ops;
							testSuite.save((err, data) => {
								callback(err, data);
							});
						} else {
							callback(err);
						}
					});
				} else {
					callback(err);
				}
			});
		});
	}
}

export {TestResultsCollector};
