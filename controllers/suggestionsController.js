import {GithubHelper} from '../helpers/githubHelper';
const FILE_NAME_PREFIX = 'suggestion_';
const BRANCH_PREFIX = 'ludwig-';

class SuggestionsController {
	constructor(configuration) {
		this._configuration = configuration;
	}

	get githubHelper() {
		if (!this._githubHelper) {
			this._githubHelper = new GithubHelper(this._configuration);
		}
		return this._githubHelper;
	}

	/*
	 This function chains github API calls in order to create a pull request
	 @param accessToken: A valid accessToken to access the github API
	 @param title: (string) Will be used as a title for the pull request creation
	 @param description: (urlencoded JSON string) The state we want to record
	 @param state: (urlencoded JSON string) The state we want to record
	 @param res: An expressjs Response object to get back to the user
	 */
	createPullRequest(title, description, state, res) {
		const accessToken = process.env.npm_config_ludwig_accessToken;
		const now = (new Date()).getTime();
		const newBranchName = BRANCH_PREFIX + now;

		if (necessaryPullRequestDataIsDefinedAndNotEmpty(accessToken, title, description, state)) {
			const pullRequestFlowPromise = this.githubHelper.getHeadReferenceForBranch(this._configuration.github.branch || 'master');

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
					res.status(500).send(reason);
				});
		} else {
			res.status(500).send({ error: 'Missing input' });
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
