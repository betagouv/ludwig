import {XUnitParser} from './parsers/xUnitParser';
import mongoose from 'mongoose';
import {TestSuiteModel} from '../models/testSuiteModel';
import {TestCaseModel} from '../models/testCaseModel';


class TestResultsCollector {
	constructor(configuration) {
		this.configuration = configuration;
	}

	connect() {
		mongoose.connect(this.configuration.mongo.uri, this.configuration.mongo.options);
	}
	
	get parser() {
		return new XUnitParser(this.configuration);
	}

	saveFromXUnitData(xUnitFilePath, callback) {
		this.connect();
		this.parser.parse(xUnitFilePath).then( (parsedTestSuiteData) => {
			let testSuite = new TestSuiteModel({
				name: parsedTestSuiteData.name,
				failures: parsedTestSuiteData.failures,
				timestamp: parsedTestSuiteData.timestamp
			});

			testSuite.save((err) => {
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
		}).catch( (errors) => {
			callback(errors);
		});
	}
}

export {TestResultsCollector};
