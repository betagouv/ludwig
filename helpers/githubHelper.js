'use strict';
let superAgent = require('superagent');
const githubConfig = {
	referencesEndpoint:'https://api.github.com/repos/hoshin/git-api-tests/git/refs',
	createContent:'https://api.github.com/repos/hoshin/git-api-tests/contents/',
	createPullRequest:'https://api.github.com/repos/hoshin/git-api-tests/pulls'
};

class GithubHelper {
	constructor() {

	}

	config() {
		return githubConfig;
	}

	agent() {
		return superAgent;
	}

	createPullRequestRequestBody(head, title, body) {
		return `{"head":"refs/heads/${head}", "base":"master", "title":"${title}", "body":"${body}"}`;
	}

	createPullRequest(head, title, body, accessToken) {
		return new Promise( (resolve) => {
			this.agent()
				.post(this.config().createPullRequest)
				.send(this.createPullRequestRequestBody(head, title, body))
				.set('Authorization', `token ${accessToken}`)
				.end((err, dataToReturn) => {
					resolve(dataToReturn);
				});
		});
	}

	createContentRequestBody(testFileName, branchName, commitMessage, base64FileContents) {
		return `{"path":"${testFileName}", "branch":"${branchName}", "message":"${commitMessage}", "content":"${base64FileContents}"}`;
	}

	createContent(accessToken, testFileName, branchName, commitMessage, base64FileContents) {
		return new Promise( (resolve) => {
			this.agent()
				.put(`${this.config().createContent}${testFileName}`)
				.send(this.createContentRequestBody(testFileName, branchName, commitMessage, base64FileContents))
				.set('Authorization', `token ${accessToken}`)
				.end((err, createCommitResult) => {
					resolve(createCommitResult);
				});
		});
	}

	createReferenceRequestBody(newBranchName, commitReferenceToBranchFrom) {
		return `{"ref":"refs/heads/${newBranchName}", "sha":"${commitReferenceToBranchFrom}"}`;
	}

	createReference(accessToken, newBranchName, commitReferenceToBranchFrom) {
		return new Promise( (resolve) => {
			this.agent()
				.post(this.config().referencesEndpoint)
				.send(this.createReferenceRequestBody(newBranchName, commitReferenceToBranchFrom))
				.set('Authorization', `token ${accessToken}`)
				.end((err, createReferenceResult) => {
					resolve(createReferenceResult);
				});
		});
	}

	getHeadReferenceForBranch(requestedBranch) {
		return new Promise( (resolve, reject) => {
			this.agent()
				.get(this.config().referencesEndpoint)
				.end((err, response) => {

					const responseBody = response.body;
					if (responseBody && Array.isArray(responseBody)) {
						let branchRef = null;
						responseBody.forEach((singleReference) => {
							if (singleReference.ref === `refs/heads/${requestedBranch}`) {
								branchRef = singleReference.object.sha;
							}
						});
						if (branchRef) {
							resolve(branchRef);
						} else {
							reject({
								message: 'Required branch not found',
								details: `Reference searched for : refs/heads/${requestedBranch}`
							});
						}
					} else {
						reject({message: 'Not able to retrieve references', details: err? err.message : ''});
					}
				});
		});

	}
}

export {GithubHelper};