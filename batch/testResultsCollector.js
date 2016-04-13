import {XUnitParser} from './parsers/xUnitParser';
import mongoose from 'mongoose';
import {TestSuiteModel} from '../models/testSuiteModel';
import {TestCaseModel} from '../models/testCaseModel';


class TestResultsCollector {
	constructor(configuration) {
		this.configuration = configuration;
		mongoose.connect(configuration.mongo.uri, configuration.mongo.options);
	}

	saveFromXUnitData(xUnitFilePath, callback) {
		const parser = new XUnitParser(this.configuration);
		parser.parse(xUnitFilePath, (errors, parsedTestSuiteData) => {
			let testSuite = new TestSuiteModel({
				name: parsedTestSuiteData.name,
				failures: parsedTestSuiteData.failures,
				timestamp: parsedTestSuiteData.timestamp
			});

			testSuite.save((err) => {
				if (!err) {
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
