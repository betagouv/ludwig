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

			if (match[1].match(/repos\/user\/reponame\/contents\/.*/)) {
				return {};
			}

			if (match[1] === 'repos/user/reponame/git/refs') {
				return {};
			}
			return {};
		}
	} ];

	beforeEach(() => {
		githubHelper = new GithubHelper();
	});

	describe('createPullRequest', () => {
		it('should send an OK response if pull request was created on configured repo', () => {
			//setup
			const superagentMock = require('superagent-mock')(request, config);
			sinon.stub(githubHelper, 'agent').returns(request);
			const head = 'head', title = 'PR title', body = 'PR body', accessToken = 'access token 12434', callback = sinon.spy();
			sinon.stub(githubHelper, 'config').returns({createPullRequest: 'https://api.github.com/repos/user/reponame/pulls'});
			//action
			githubHelper.createPullRequest(head, title, body, accessToken, callback);
			//assert
			assert.equal(callback.calledOnce, true);
			assert.deepEqual(callback.getCall(0).args[1], {
				'url': 'https://api.github.com/repos/user/reponame/pulls/19'
			});
			superagentMock.unset();
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
		it('should callback in a KO state if an error occurred when retrieving refs list', () => {
			//setup
			const config = [ {
				pattern: 'https://api.github.com/(.*)',
				get: () => {
					throw new Error('Can\'t retrieve references');
				},
				fixtures: (match) => {
					if (match[1] === 'repos/user/reponame/git/refs') {
						return {};
					}
					return {};
				}
			} ];

			const superagentMock = require('superagent-mock')(request, config);
			const callbackSpy = sinon.spy();
			sinon.stub(githubHelper, 'agent').returns(request);
			sinon.stub(githubHelper, 'config').returns({referencesEndpoint: 'https://api.github.com/repos/user/reponame/pulls'});
			//action
			githubHelper.getHeadReferenceForBranch('', callbackSpy);
			//assert
			assert.equal(callbackSpy.calledOnce, true);
			assert.deepEqual(callbackSpy.getCall(0).args, [ {
				message: 'Not able to retrieve references',
				details: 'Can\'t retrieve references'
			} ]);
			superagentMock.unset();
		});

		it('should callback in a KO state if no reference for requested branch foobar was found', () => {
			//setup
			const config = [ {
				pattern: 'https://api.github.com/(.*)',
				get: () => {
					return {res: {body: []}};
				},
				fixtures: (match) => {
					if (match[1] === 'repos/user/reponame/git/refs') {
						return {};
					}
					return {};
				}
			} ];

			const superagentMock = require('superagent-mock')(request, config);
			const callbackSpy = sinon.spy();
			sinon.stub(githubHelper, 'agent').returns(request);
			sinon.stub(githubHelper, 'config').returns({referencesEndpoint: 'https://api.github.com/repos/user/reponame/pulls'});
			//action
			githubHelper.getHeadReferenceForBranch('foobarbaz', callbackSpy);
			//assert
			assert.equal(callbackSpy.calledOnce, true);
			assert.deepEqual(callbackSpy.getCall(0).args, [ {
				message: 'Required branch not found',
				details: 'Reference searched for : refs/heads/foobarbaz'
			} ]);
			superagentMock.unset();
		});

		it('should callback in an OK state w/ the sha reference of the branch looked up', () => {
			//setup
			const config = [ {
				pattern: 'https://api.github.com/(.*)',
				get: () => {
					return {res: {body: [ {ref:'refs/heads/foobar', object:{sha:'shacode for foobar'}} ]}};
				},
				fixtures: (match) => {
					if (match[1] === 'repos/user/reponame/git/refs') {
						return {};
					}
					return {};
				}
			} ];

			const superagentMock = require('superagent-mock')(request, config);
			const callbackSpy = sinon.spy();
			sinon.stub(githubHelper, 'agent').returns(request);
			sinon.stub(githubHelper, 'config').returns({referencesEndpoint: 'https://api.github.com/repos/user/reponame/pulls'});
			//action
			githubHelper.getHeadReferenceForBranch('foobar', callbackSpy);
			//assert
			assert.equal(callbackSpy.calledOnce, true);
			assert.deepEqual(callbackSpy.getCall(0).args, [ null, 'shacode for foobar' ]);
			superagentMock.unset();
		});
	});
});
