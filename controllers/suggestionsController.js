import {GithubHelper} from '../helpers/githubHelper';
const FILE_NAME_PREFIX = 'suggestion';
const BRANCH_PREFIX = 'suggestion';
const _githubHelper = new GithubHelper();

class SuggestionsController {
	constructor() {
	}

	get githubHelper() {
		return _githubHelper;
	}

	/*
	 This function chains 4 github API calls in order to create a pull request
	 @param accessToken: A valid accessToken to access the github API
	 @param title: (string) Will be used as a title for the pull request creation
	 @param description: (urlencoded JSON string) The state we want to record
	 @param state: (urlencoded JSON string) The state we want to record
	 @param res: An expressjs Response object to get back to the user
	 @param branchToCreatePullRequestsTo: the branch to create a pull request for
	 */
	createPullRequest(accessToken, title, description, state, res, branchToCreatePullRequestsTo) {
		const now = (new Date()).getTime();
		const newBranchName = BRANCH_PREFIX + now;

		if (necessaryPullRequestDataIsDefinedAndNotEmpty(accessToken, title, description, state)) {
			const pullRequestFlowPromise = this.githubHelper.getHeadReferenceForBranch(branchToCreatePullRequestsTo || 'master');

			return pullRequestFlowPromise
				.then(headerReference => this.githubHelper.createReference(accessToken, newBranchName, headerReference))
				.then(() => {
					const testFileName = `${FILE_NAME_PREFIX}${now}.txt`;
					const stateStringBuffer = new Buffer(state);
					const base64FileContents = stateStringBuffer.toString('base64');
					return this.githubHelper.createContent(accessToken, testFileName, newBranchName, description, base64FileContents, res.req.session.passport.user);
				})
				.then(() => this.githubHelper.createPullRequest(newBranchName, title, description, accessToken))
				.then(newPullRequestData => res.render('ok', {pullRequestURL: newPullRequestData.body.html_url}))
				.catch(reason => {
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