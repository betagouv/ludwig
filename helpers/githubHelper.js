'use strict';
let superAgent = require('superagent');
let config = require('../ludwig-conf');

class GithubHelper {
	constructor() {

	}
	config() {
		return config;
	}
	agent() {
		return superAgent;
	}
	createPullRequestRequestBody(head, title, body) {
		return `{"head":"refs/heads/${head}", "base":"master", "title":"${title}", "body":"${body}"}`;
	}
	createPullRequest(head, title, body, accessToken, callback) {
		this.agent()
			.post(this.config().github.apiEndpoints.createPullRequest)
			.send(this.createPullRequestRequestBody(head, title, body))
			.set('Authorization', `token ${accessToken}`)
			.end((err, dataToReturn) => {
				callback(null, dataToReturn);
			});
	}
	createContentRequestBody(testFileName, branchName, commitMessage, base64FileContents) {
		return `{"path":"${testFileName}", "branch":"${branchName}", "message":"${commitMessage}", "content":"${base64FileContents}"}`;
	}
	createContent(accessToken, testFileName, branchName, commitMessage, base64FileContents, callback) {
		this.agent()
			.put(`${this.config().github.apiEndpoints.createContent}${testFileName}`)
			.send(this.createContentRequestBody(testFileName, branchName, commitMessage, base64FileContents))
			.set('Authorization', `token ${accessToken}`)
			.end((err, createCommitResult) => {
				callback(null, createCommitResult);
			});
	}
	createReferenceRequestBody(newBranchName, commitReferenceToBranchFrom) {
		return `{"ref":"refs/heads/${newBranchName}", "sha":"${commitReferenceToBranchFrom}"}`;
	}
	createReference(accessToken, newBranchName, commitReferenceToBranchFrom, callback) {
		this.agent()
			.post(this.config().github.apiEndpoints.createRef)
			.send(this.createReferenceRequestBody(newBranchName, commitReferenceToBranchFrom))
			.set('Authorization', `token ${accessToken}`)
			.end((err, createReferenceResult) => {
				callback(null, createReferenceResult);
			});
	}
}

export {GithubHelper};