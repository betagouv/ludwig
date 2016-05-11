import {XUnitParser} from './parsers/xUnitParser';
import {GithubHelper} from '../helpers/githubHelper';
import {GitHelper} from '../helpers/gitHelper';
import LudwigDAO from '../database/ludwigDAO';

class TestResultsCollector {
	constructor(ludwigConfiguration) {
		this.configuration = ludwigConfiguration;
		this.parser = new XUnitParser(this.configuration);
		this.githubHelper = new GithubHelper(this.configuration);
		this.dao = LudwigDAO;
		this.gitHelper = new GitHelper(ludwigConfiguration);
	}

	saveFromXUnitData(xUnitFilePath) {
		return this.gitHelper.init()
			.then(() => {
				const gitHelper = this.gitHelper;
				return this.parser.parseTestSuiteFromFile(xUnitFilePath).then((parsedTestSuiteData) => {
					const testCasePromises = parsedTestSuiteData.testCases.map((testCase) => {
						return gitHelper.getEarliestCommitAuthorForFile(testCase.location);
					});
					return Promise.all(testCasePromises)
						.then((values) => {
							parsedTestSuiteData.testCases.forEach((value, index) => {
								value.author = values[index].commit.author;
							});

							return this.dao.saveCompleteTestSuite(parsedTestSuiteData);
						});
				});
			});
	}
}

export {TestResultsCollector};
