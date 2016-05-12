import {XUnitParser} from './parsers/xUnitParser';
import {GithubHelper} from '../helpers/githubHelper';
import LudwigDAO from '../database/ludwigDAO';

class TestResultsCollector {
	constructor(ludwigConfiguration) {
		this.configuration = ludwigConfiguration;
		this.parser = new XUnitParser(this.configuration);
		this.githubHelper = new GithubHelper(this.configuration);
		this.dao = LudwigDAO;
	}

	saveFromXUnitData(xUnitFilePath) {
		const githubHelper = this.githubHelper;
		return this.parser.parseTestSuiteFromFile(xUnitFilePath).then((parsedTestSuiteData) => {
			const testCasePromises = parsedTestSuiteData.testCases.map((testCase) => {
				return githubHelper.getFirstCommitForFile(testCase.location);
			});

			return Promise.all(testCasePromises)
				.then((values) => {
					parsedTestSuiteData.testCases.forEach((value, index) => {
						value.author = values[index].commit.author;
						value.author.githubId = values[index].author.id;
					});

					return this.dao.saveCompleteTestSuite(parsedTestSuiteData);
				});
		});
	}
}

export {TestResultsCollector};
