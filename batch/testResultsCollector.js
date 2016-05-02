import {XUnitParser} from './parsers/xUnitParser';
import {GithubHelper} from '../helpers/githubHelper';
import LudwigDAO from '../database/ludwigDAO';

class TestResultsCollector {
	constructor(ludwigConfiguration) {
		this.configuration = ludwigConfiguration;
		this._xUnitParser = new XUnitParser(this.configuration);
		this._githubHelper = new GithubHelper(this.configuration);
		this._dao = LudwigDAO;
	}

	get parser() {
		return this._xUnitParser;
	}

	get githubHelper() {
		return this._githubHelper;
	}

	get dao() {
		return this._dao;
	}

	saveFromXUnitData(xUnitFilePath, callback) {
		const githubHelper = this.githubHelper;
		this.parser.parseTestSuiteFromFile(xUnitFilePath).then((parsedTestSuiteData) => {
			const testCasePromises = parsedTestSuiteData.testCases.map((testCase) => {
				return githubHelper.getFirstCommitForFile(testCase.location);
			});

			Promise.all(testCasePromises)
				.then((values) => {
					parsedTestSuiteData.testCases.forEach((value, index) => {
						value.author = values[index].commit.author;
						value.author.githubId = values[index].author.id;
					});

					return this.dao.saveCompleteTestSuite(parsedTestSuiteData);
				})
				.then((savedData) => {
					callback(null, savedData);
				})
				.catch((err) => {
					callback(err);
				});
		}).catch((errors) => {
			callback(errors);
		});
	}
}

export {TestResultsCollector};
