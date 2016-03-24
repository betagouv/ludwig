/*global describe it beforeEach*/
import {assert} from 'chai';
import sinon from 'sinon';
import {GithubHelper} from '../../helpers/githubHelper';
import request from 'superagent';

describe('Github Helper', () => {
	let githubHelper;
	const config = [ {
		pattern: 'https://api.github.com/(.*)',
		post: (match, data) => {
			return data;
		},
		put: (match, data) => {
			return data;
		},
		get: () => {
			return {res: {body: {}}};
		},
		fixtures: (match) => {
			if (match[1] === 'repos/user/reponame/pulls') {
				return {
					'url': 'https://api.github.com/repos/user/reponame/pulls/19'
				};
			}
			return {};
		}
	} ];

	beforeEach(() => {
		githubHelper = new GithubHelper();
	});

	describe('createPullRequest', () => {
		it('should send an OK response if pull request was created on configured repo', (done) => {
			//setup
			const superagentMock = require('superagent-mock')(request, config);
			sinon.stub(githubHelper, 'agent').returns(request);
			const head = 'head', title = 'PR title', body = 'PR body', accessToken = 'access token 12434';
			sinon.stub(githubHelper, 'config').returns({createPullRequest: 'https://api.github.com/repos/user/reponame/pulls'});
			//action
			const createPRPromise = githubHelper.createPullRequest(head, title, body, accessToken);
			//assert
			createPRPromise.then( (data) => {
				assert.deepEqual(data, {
					'url': 'https://api.github.com/repos/user/reponame/pulls/19'
				});
				superagentMock.unset();
				done();
			});
		});
	});
	describe('createPullRequestRequestBody', () => {
		it('should generate a correctly constructed pull request request body', () => {
			//setup
			const head = 'submitterBranch', title = 'PR title', body = 'PR body';
			//action
			const actual = githubHelper.createPullRequestRequestBody(head, title, body);
			//assert
			assert.equal(actual, '{"head":"refs/heads/submitterBranch", "base":"master", "title":"PR title", "body":"PR body"}');
		});
	});

	describe('createContentRequestBody', () => {
		it('should generate a correctly constructed commit request body', () => {
			//setup
			const suggestionFileName = 'path for the suggestion file', branchName = 'branch to commit to', commitMessage = 'commit message', base64FileContents = 'Base64 Contents';
			//action
			const actual = githubHelper.createContentRequestBody(suggestionFileName, branchName, commitMessage, base64FileContents);
			//assert
			assert.equal(actual, '{"path":"path for the suggestion file", "branch":"branch to commit to", "message":"commit message", "content":"Base64 Contents"}');
		});
	});

	describe('createReferenceRequestBody', () => {
		it('should generate a correctly constructed reference creation request body', () => {
			//setup
			const newBranchName = 'newBranchName', commitReferenceToBranchFrom = 'commit sha1 reference to branch from';
			//action
			const actual = githubHelper.createReferenceRequestBody(newBranchName, commitReferenceToBranchFrom);
			//assert
			assert.equal(actual, '{"ref":"refs/heads/newBranchName", "sha":"commit sha1 reference to branch from"}');
		});
	});

	describe('getHeadReferenceForBranch', () => {
		it('should return a rejected promise if an error occurred when retrieving refs list', (done) => {
			//setup
			const config = [ {
				pattern: 'https://api.github.com/(.*)',
				get: () => {
					throw new Error('Can\'t retrieve references');
				},
				fixtures: () => {
					return {};
				}
			} ];

			const superagentMock = require('superagent-mock')(request, config);
			sinon.stub(githubHelper, 'agent').returns(request);
			sinon.stub(githubHelper, 'config').returns({referencesEndpoint: 'https://api.github.com/repos/user/reponame/pulls'});
			//action
			const getHeadReferencesForBranchPromise = githubHelper.getHeadReferenceForBranch('');
			//assert
			getHeadReferencesForBranchPromise.catch( (message) => {
				assert.deepEqual(message, {
					message: 'Not able to retrieve references',
					details: 'Can\'t retrieve references'
				});
				superagentMock.unset();
				done();
			});

		});

		it('should return a rejected promise if no reference for requested branch foobar was found', (done) => {
			//setup
			const config = [ {
				pattern: 'https://api.github.com/(.*)',
				get: () => {
					return {body: []};
				},
				fixtures: () => {
					return {};
				}
			} ];

			const superagentMock = require('superagent-mock')(request, config);
			sinon.stub(githubHelper, 'agent').returns(request);
			sinon.stub(githubHelper, 'config').returns({referencesEndpoint: 'https://api.github.com/repos/user/reponame/pulls'});
			//action
			const getHeadReferencesForBranchPromise = githubHelper.getHeadReferenceForBranch('foobarbaz');
			//assert
			getHeadReferencesForBranchPromise.catch( (message) => {
				assert.deepEqual(message, {
					message: 'Required branch not found',
					details: 'Reference searched for: refs/heads/foobarbaz'
				});
				superagentMock.unset();

				done();
			});
		});

		it('should return a resolved promise w/ the sha reference of the branch looked up', (done) => {
			//setup
			const config = [ {
				pattern: 'https://api.github.com/(.*)',
				get: () => {
					return {body: [ {ref:'refs/heads/foobar', object:{sha:'shacode for foobar'}} ]};
				},
				fixtures: () => {
					return {};
				}
			} ];

			const superagentMock = require('superagent-mock')(request, config);
			sinon.stub(githubHelper, 'agent').returns(request);
			sinon.stub(githubHelper, 'config').returns({referencesEndpoint: 'https://api.github.com/repos/user/reponame/pulls'});
			//action
			const getHeadReferencesForBranchPromise = githubHelper.getHeadReferenceForBranch('foobar');
			//assert
			getHeadReferencesForBranchPromise.then( (data) => {
				assert.deepEqual(data, 'shacode for foobar' );
				superagentMock.unset();
				done();
			});
		});
	});
});
