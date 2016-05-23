'use strict';
import superAgent from 'superagent';

const GITHUB_API_REPO_URL_PREFIX = 'https://api.github.com/repos/';

class GithubHelper {
	constructor(configuration) {
		this.githubConfig = {
			referencesEndpoint: `${GITHUB_API_REPO_URL_PREFIX}${configuration.repo}/git/refs`,
			createContent: `${GITHUB_API_REPO_URL_PREFIX}${configuration.repo}/contents/`,
			createPullRequest: `${GITHUB_API_REPO_URL_PREFIX}${configuration.repo}/pulls`,
			commitsEndpoint: `${GITHUB_API_REPO_URL_PREFIX}${configuration.repo}/commits`,
			repository: configuration.repo,
			acceptedTestsLocation: configuration.acceptedTestsLocation,
			github: configuration.github
		};
	}

	get config() {
		return this.githubConfig;
	}

	get agent() {
		return superAgent;
	}

	createPullRequestRequestBody(head, title, body, baseBranch) {
		const pullRequestBody = {
			head: `refs/heads/${head}`,
			base: baseBranch || 'master',
			title: title,
			body: body
		};
		return JSON.stringify(pullRequestBody);
	}

	createPullRequest(head, title, body, accessToken) {
		const self = this;
		return new Promise((resolve, reject) => {
			this.agent
				.post(this.config.createPullRequest)
				.send(this.createPullRequestRequestBody(head, title, body, self.githubConfig.github.branch))
				.set('Authorization', `token ${accessToken}`)
				.end((err, createPRResult) => {
					if (err) {
						reject({message: err.message, details: err});
					} else {
						resolve(createPRResult);
					}
				});
		});
	}

	createContentRequestBody(testFileName, branchName, commitMessage, base64FileContents, authorData) {
		const contentRequestBodyJSON = {
			path: testFileName,
			branch: branchName,
			message: commitMessage,
			content: base64FileContents
		};
		function authorDataContainsRequiredInformation() {
			return authorData && authorData.username && Array.isArray(authorData.emails) && authorData.emails.length;
		}

		if (authorDataContainsRequiredInformation()) {
			const author = {
				name: authorData.username,
				email: authorData.emails[0].value
			};
			contentRequestBodyJSON.author = author;
		}
		return JSON.stringify(contentRequestBodyJSON);
	}

	createContent(accessToken, testFileName, branchName, commitMessage, base64FileContents, authorData) {
		return new Promise((resolve, reject) => {
			this.agent
				.put(`${this.config.createContent}${this.githubConfig.acceptedTestsLocation}/${testFileName}`)
				.send(this.createContentRequestBody(`${this.githubConfig.acceptedTestsLocation}/${testFileName}`, branchName, commitMessage, base64FileContents, authorData))
				.set('Authorization', `token ${accessToken}`)
				.end((err, createCommitResult) => {
					if (err) {
						console.error(err);
						reject({message: err.message, details: err});
					} else {
						resolve(createCommitResult);
					}
				});
		});
	}

	createReferenceRequestBody(newBranchName, branchToCreatePullRequestsFor) {
		const referenceRequestJSONBody = {
			ref: `refs/heads/${newBranchName}`,
			sha: branchToCreatePullRequestsFor
		};
		return JSON.stringify(referenceRequestJSONBody);
	}

	createReference(accessToken, newBranchName, branchToCreatePullRequestsFor) {
		return new Promise((resolve, reject) => {
			this.agent
				.post(this.config.referencesEndpoint)
				.send(this.createReferenceRequestBody(newBranchName, branchToCreatePullRequestsFor))
				.set('Authorization', `token ${accessToken}`)
				.end((err, createReferenceResult) => {
					if (err) {
						console.error(err);
						reject({message: err.message, details: err});
					} else {
						resolve(createReferenceResult);
					}
				});
		});
	}

	getHeadReferenceForBranch(requestedBranch) {
		console.log(`Trying to get ${this.config.referencesEndpoint}/heads/${requestedBranch}`);
		return new Promise((resolve, reject) => {
			this.agent
				.get(`${this.config.referencesEndpoint}/heads/${requestedBranch}`)
				.end((err, response) => {
					if (err) {
						return reject({message:`Not able to retrieve reference "${requestedBranch}"`, details: err && err.message});
					} else {
						const responseBody = response.body;
						if (!responseBody.object || !responseBody.object.sha) {
							return reject({
								message: 'Not able to retrieve reference',
								details: 'No reference data available'
							});
						} else {
							return resolve(responseBody.object.sha);
						}
					}
				});
		});
	}

	getFirstCommitForFile(fileName) {
		const anteChronologicalOrder = (firstCommit, secondCommit) => {
			const firstDate = new Date(firstCommit.commit.author.date);
			const secondDate = new Date(secondCommit.commit.author.date);
			return firstDate.getTime() - secondDate.getTime();
		};
		return new Promise((resolve, reject) => {
			this.agent
				.get(`${this.config.commitsEndpoint}?path=${fileName}&client_id=${process.env.npm_config_ludwig_clientID}&client_secret=${process.env.npm_config_ludwig_clientSecret}`)
				.end((err, response) => {
					if (err) {
						return reject({message: 'Not able to retrieve commit', details: err && err.message});
					}
					response.body.sort(anteChronologicalOrder);
					resolve(response.body[0]);
				});
		});
	}
}

export {GithubHelper};
