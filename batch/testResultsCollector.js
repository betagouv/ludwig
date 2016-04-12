import {XUnitParser} from './parsers/xUnitParser';
import mongoose from 'mongoose';
import {TestSuiteModel} from '../models/testSuiteModel';
import {TestCaseModel} from '../models/testCaseModel';
import {GithubHelper} from '../helpers/githubHelper';

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

	get testCaseModel() {
		return TestCaseModel;
	}

	get githubHelper() {
		return new GithubHelper();
	}
	
	createNewTestSuite(parsedTestSuiteData) {
		return new TestSuiteModel({
			name: parsedTestSuiteData.name,
			failures: parsedTestSuiteData.failures,
			timestamp: parsedTestSuiteData.timestamp
		});
	}

	saveFromXUnitData(xUnitFilePath, callback) {
		this.connect();
		const githubHelper = this.githubHelper;
		this.parser.parse(xUnitFilePath).then( (parsedTestSuiteData) => {
			const testSuiteModel = this.createNewTestSuite(parsedTestSuiteData);
			const testCasePromises = [];
			parsedTestSuiteData.testCases.forEach((testCase) => {
				testCasePromises.push(githubHelper.getFirstCommitForFile(testCase.location));
			});
			Promise.all(testCasePromises).then( (values) => {
				parsedTestSuiteData.testCases.forEach( (value, index) => {
					value.author = values[index].commit.author;
				});
				testSuiteModel.save((err) => {
					if (!err) {
						this.testCaseModel.collection.insert(parsedTestSuiteData.testCases, (err, testCases) => {
							if (!err) {
								testSuiteModel.testCases = testCases.ops;
								testSuiteModel.save((err, data) => {
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
			}).catch( (err) => {
				callback(err);
			});
		}).catch( (errors) => {
			callback(errors);
		});
	}
}

export {TestResultsCollector};
