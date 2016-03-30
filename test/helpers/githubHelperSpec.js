/*global describe it beforeEach*/
import {assert} from 'chai';
import sinon from 'sinon';
import {GithubHelper} from '../../helpers/githubHelper';
import request from 'superagent';

describe('Github Helper', () => {
	let githubHelper;

	beforeEach(() => {
		githubHelper = new GithubHelper();
	});

	describe('createPullRequestRequestBody', () => {
		it('should generate a correctly constructed pull request request body', () => {
			//setup
			const head = 'submitterBranch', title = 'PR title', body = 'PR body';
			//action
			const actual = githubHelper.createPullRequestRequestBody(head, title, body);
			//assert
			assert.equal(actual, '{"head":"refs/heads/submitterBranch","base":"master","title":"PR title","body":"PR body"}');
		});
	});

	describe('createContentRequestBody', () => {
		it('should generate a correctly constructed commit request body', () => {
			//setup
			const suggestionFileName = 'path for the suggestion file', branchName = 'branch to commit to', commitMessage = 'commit message', base64FileContents = 'Base64 Contents';
			//action
			const actual = githubHelper.createContentRequestBody(suggestionFileName, branchName, commitMessage, base64FileContents);
			//assert
			assert.equal(actual, '{"path":"path for the suggestion file","branch":"branch to commit to","message":"commit message","content":"Base64 Contents"}');
		});
	});

	describe('createReferenceRequestBody', () => {
		it('should generate a correctly constructed reference creation request body', () => {
			//setup
			const newBranchName = 'newBranchName', 	branchToCreatePullRequestsFor = 'commit sha1 reference to branch from';
			//action
			const actual = githubHelper.createReferenceRequestBody(newBranchName, branchToCreatePullRequestsFor );
			//assert
			assert.equal(actual, '{"ref":"refs/heads/newBranchName","sha":"commit sha1 reference to branch from"}');
		});
	});

	describe('createPullrequest', () => {
		it('should return a resolved promise if API call went on with no issues', (done) => {
			//setup
			const config = [ {
				pattern: 'https://api.github.com/(.*)',
				post: () => {
					return {ok:'some data', statusCode:201} ;
				},
				fixtures: () => {
					return {};
				}
			} ];

			const superagentMock = require('superagent-mock')(request, config);
			sinon.stub(githubHelper, 'agent').returns(request);
			sinon.stub(githubHelper, 'config').returns({createPullRequest: 'https://api.github.com/repos/user/reponame/pulls'});
			//action
			const createPullRequestPromise = githubHelper.createPullRequest('head', 'title', 'body', 'accessToken');
			//assert
			createPullRequestPromise.then( (data) => {
				assert.deepEqual(data, {ok : 'some data', statusCode:201} );
				superagentMock.unset();
				done();
			});
		});

		it('should return a rejected promise if an error was thrown during the API call', (done) => {
			//setup
			const config = [ {
				pattern: 'https://api.github.com/(.*)',
				post: () => {
					throw new Error('some PR error message');
				},
				fixtures: () => {
					return {};
				}
			} ];

			const superagentMock = require('superagent-mock')(request, config);
			sinon.stub(githubHelper, 'agent').returns(request);
			sinon.stub(githubHelper, 'config').returns({createPullRequest: 'https://api.github.com/repos/user/reponame/pulls'});
			//action
			const createPullRequestPromise = githubHelper.createPullRequest('head', 'title', 'body', 'accessToken');
			//assert
			createPullRequestPromise.catch( (message) => {
				assert.deepEqual(message.message, 'some PR error message' );
				superagentMock.unset();
				done();
			});
		});
	});

	describe('createContent', () => {
		it('should return a resolved promise if API call went on with no issues', (done) => {
			//setup
			const config = [ {
				pattern: 'https://api.github.com/(.*)',
				put: () => {
					return {ok:'some data'} ;
				},
				fixtures: () => {
					return {};
				}
			} ];

			const superagentMock = require('superagent-mock')(request, config);
			sinon.stub(githubHelper, 'agent').returns(request);
			sinon.stub(githubHelper, 'config').returns({createContent: 'https://api.github.com/repos/user/reponame/pulls'});
			//action
			const createContentPromise = githubHelper.createContent('accessToken', 'testFileName', 'branchName', 'commitMessage', 'b64FC==');
			//assert
			createContentPromise.then( (data) => {
				assert.deepEqual(data, {ok : 'some data'} );
				superagentMock.unset();
				done();
			});
		});

		it('should return a rejected promise if API call threw an error', (done) => {
			//setup
			const config = [ {
				pattern: 'https://api.github.com/(.*)',
				put: () => {
					throw new Error('some content error message');
				},
				fixtures: () => {
					return {};
				}
			} ];

			const superagentMock = require('superagent-mock')(request, config);
			sinon.stub(githubHelper, 'agent').returns(request);
			sinon.stub(githubHelper, 'config').returns({createContent: 'https://api.github.com/repos/user/reponame/pulls'});
			//action
			const createContentPromise = githubHelper.createContent('accessToken', 'testFileName', 'branchName', 'commitMessage', 'b64FC==');
			//assert
			createContentPromise.catch( (message) => {
				assert.deepEqual(message.message, 'some content error message' );
				superagentMock.unset();
				done();
			});
		});
	});

	describe('createReferenceForBranch', () => {
		it('should return a resolved promise if there is no error', (done) => {
			//setup
			const config = [ {
				pattern: 'https://api.github.com/(.*)',
				post: () => {
					return {ok:'some data', statusCode:201} ;
				},
				fixtures: () => {
					return {};
				}
			} ];

			const superagentMock = require('superagent-mock')(request, config);
			sinon.stub(githubHelper, 'agent').returns(request);
			sinon.stub(githubHelper, 'config').returns({referencesEndpoint: 'https://api.github.com/repos/user/reponame/pulls'});
			//action
			const createReferencePromise = githubHelper.createReference('accessToken', 'newBranchName', 'master');
			//assert
			createReferencePromise.then( (data) => {
				assert.deepEqual(data, {ok : 'some data', statusCode:201} );
				superagentMock.unset();
				done();
			});
		});

		it('should return a rejected promise if an error is triggered during the call', (done) => {
			//setup
			const config = [ {
				pattern: 'https://api.github.com/(.*)',
				post: () => {
					throw new Error('some new error');
				},
				fixtures: () => {
					return {};
				}
			} ];

			const superagentMock = require('superagent-mock')(request, config);
			sinon.stub(githubHelper, 'agent').returns(request);
			sinon.stub(githubHelper, 'config').returns({referencesEndpoint: 'https://api.github.com/repos/user/reponame/pulls'});
			//action
			const createReferencePromise = githubHelper.createReference('accessToken', 'newBranchName', 'master');
			//assert
			createReferencePromise.catch( (message) => {
				assert.deepEqual(message.message, 'some new error' );
				superagentMock.unset();
				done();
			});
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
					return {body: [], statusCode:200};
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

		it('should return a rejected promise if call succeeded but the returned body is not an array', (done) => {
			//setup
			const config = [ {
				pattern: 'https://api.github.com/(.*)',
				get: () => {
					return {statusCode:200};
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
					message: 'Not able to retrieve references',
					details: 'Body does not contain references list'
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
					return {body: [ {ref:'refs/heads/foobar', object:{sha:'shacode for foobar'}} ], statusCode:200};
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
