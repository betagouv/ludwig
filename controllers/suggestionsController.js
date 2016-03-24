import {GithubHelper} from '../helpers/githubHelper';
const FILE_NAME_PREFIX = 'suggestion';
const BRANCH_PREFIX = 'suggestion';
const _githubHelper = new GithubHelper();

class SuggestionsController {
	constructor() {
	}

	githubHelper() {
		return _githubHelper;
	}

	/*
	 This function chains 3 github API calls in order to create a pull request
	 Right now this lacks error management (it assumes everything goes well from one call to another ... which will probably not be the case at the start)
	 @param accessToken: A valid accessToken to access the github API
	 @param title: (string) Will be used as a title for the pull request creation
	 @param state: (urlencoded JSON string) The state we want to record
	 @param res: An expressjs Response object to get back to the user
	 */
	createPullRequest(accessToken, title, description, state, res) {
		const now = (new Date()).getTime();
		const githubHelper = this.githubHelper();
		const newBranchName = BRANCH_PREFIX + now;

		if (necessaryPullRequestDataIsDefinedAndNotEmpty(accessToken, title, description, state)) {
			const pullRequestFlowPromise = githubHelper.getHeadReferenceForBranch('master');

			return pullRequestFlowPromise.then( (headerReference) => {
				return githubHelper.createReference(accessToken, newBranchName, headerReference);
			})
			.then( () => {
				const testFileName = `${FILE_NAME_PREFIX}${now}.txt`;
				const stateStringBuffer = new Buffer(state);
				const base64FileContents = stateStringBuffer.toString('base64');
				return githubHelper.createContent(accessToken, testFileName, newBranchName, description, base64FileContents);
			})
			.then( () => {
				return githubHelper.createPullRequest(newBranchName, title, description, accessToken);
			})
			.then( (newPullRequestData) => {
				res.render('ok', {pullRequestURL: newPullRequestData.body.html_url});
			})
			.catch( (reason) => {
				console.error(reason);
				res.render('ko');
			});
		} else {
			res.render('ko');
		}
	}
}

/*
 * Checks whether the pull request creation call lacks mandatory data or not
 * */
let necessaryPullRequestDataIsDefinedAndNotEmpty = (accessToken, title, description, state) => {
	return accessToken && title && description && state;
};

export {SuggestionsController};