import {GithubHelper} from '../helpers/githubHelper';
import url from 'url';

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
	 @param holder.title: (string) Will be used as a title for the pull request creation
	 @param holder.description: The full commit message and PR initial comment
	 @param holder.state: (urlencoded JSON string) The state we want to record
	 @param res: An expressjs Response object to get back to the user
	 */
	createPullRequest(holder, res) {
		const accessToken = this._configuration.github.accessToken;
		const now = (new Date()).getTime();
		const newBranchName = BRANCH_PREFIX + now;

		if (necessaryPullRequestDataIsDefinedAndNotEmpty(accessToken, holder)) {
			const pullRequestFlowPromise = this.githubHelper.getHeadReferenceForBranch(this._configuration.github.branch);

			return pullRequestFlowPromise
				.then(headerReference => this.githubHelper.createReference(accessToken, newBranchName, headerReference))
				.then(() => {
					const testFileName = `${FILE_NAME_PREFIX}${now}.txt`;
					const stateStringBuffer = new Buffer(holder.state);
					const base64FileContents = stateStringBuffer.toString('base64');
					return this.githubHelper.createContent(accessToken, testFileName, newBranchName, holder.title + '\n\n' + holder.description, base64FileContents, holder.passport.user);
				})
				.then(() => this.githubHelper.createPullRequest(newBranchName, holder.title, holder.description, accessToken))
				.then(newPullRequestData => {
					if (holder.redirect_to) {
						var redirectURL = url.parse(holder.redirect_to, true);
						delete redirectURL.search;
						redirectURL.query.contributionId = newPullRequestData.body.number;
						res.redirect(url.format(redirectURL));
					} else {
						res.render('ok', { pullRequestURL: newPullRequestData.body.html_url });
					}
				})
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
let necessaryPullRequestDataIsDefinedAndNotEmpty = (accessToken, holder) => {
	return accessToken && holder.title && holder.description && holder.state;
};

export {SuggestionsController};
