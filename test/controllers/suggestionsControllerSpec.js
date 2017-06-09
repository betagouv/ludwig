/*global describe it beforeEach process*/
import {assert} from 'chai';
import sinon from 'sinon';
import {SuggestionsController} from '../../controllers/suggestionsController';

describe('suggestionController', () => {
	let suggestionsController;
	beforeEach(() => {
		suggestionsController = new SuggestionsController({github:{accessToken: 'token'}});
	});

	describe('createPullRequest', () => {
		const testData = {
			accessToken: 'accessToken',
			title: 'title',
			description: 'description',
			state: 'state'
		};
		let res = {};
		const req = {
			ludwig: {
				committer: {},
				testSuggestion: testData,
				user: {},
			},
		};
		beforeEach(()=> {
			res = {
				send: sinon.spy(),
			};
			res.status = sinon.stub().returns(res);
		});

		it('should set the pullRequest attribute if all remote calls work without errors', (done) => {
			//setup
			const title = 'title', description = 'description';
			const pullRequestBody = {
				url: 'API URL for pull request',
				html_url: 'HTML URL for pull request'
			};
			const mockedGithubHelper = {
				getHeadReferenceForBranch: sinon.stub().returns(Promise.resolve('branchedReferenceSHA')),
				createReference: sinon.stub().returns(Promise.resolve({})),
				createContent: sinon.stub().returns(Promise.resolve({})),
				createPullRequest: sinon.stub().returns(Promise.resolve({
					body: pullRequestBody
				}))
			};

			const state = 'some custom data so that b64 keeps quiet';
			sinon.stub(suggestionsController, 'githubHelper', {
				get: () => {
					return mockedGithubHelper;
				}
			});
			//action
			const createPRPromise = suggestionsController.createPullRequest(req, res);
			//assert
			createPRPromise.then(() => {
				assert(mockedGithubHelper.createReference.calledOnce);
				assert(mockedGithubHelper.createPullRequest.calledOnce);
				assert(mockedGithubHelper.createContent.calledOnce);
				assert(mockedGithubHelper.getHeadReferenceForBranch.calledOnce);
				assert(mockedGithubHelper.getHeadReferenceForBranch.calledOnce);
				assert.deepEqual(req.ludwig.pullRequest, pullRequestBody);
				done();
			});
		});

		const paramsCombinationsWithMissingParams = [
			{
				title: 'accessToken is',
				data: {}
			},
			{
				title: 'title is',
				data: {
					accessToken: 'accessToken'
				}
			},
			{
				title: 'description is',
				data: {
					accessToken: 'accessToken',
					title: 'title'
				}
			},
			{
				title: 'state is',
				data: {
					accessToken: 'accessToken',
					title: 'title',
					description: 'description'
				}
			}
		];

		paramsCombinationsWithMissingParams.forEach((testCase) => {
			it(`should return an error if ${testCase.title} missing`, () => {
				//setup
				const ludwig = Object.assign({}, req.ludwig, { testSuggestion: testCase.data });
				const testedReq = Object.assign({}, req, { ludwig: ludwig });
				//action
				suggestionsController.createPullRequest(testedReq, res);
				//assert
				assert(res.send.calledOnce);
				assert(res.status.calledOnce);
				assert.equal(res.status.firstCall.args[0], 500);
			});
		});

		it('should return an error if reference creation call returns an error (and not try to create content)', function (done) {
			//setup
			const createContentSpy = sinon.spy();
			sinon.stub(suggestionsController, 'githubHelper', {
				get: () => {
					return {
						createReference: sinon.stub().returns(Promise.reject({error: true})),
						createContent: createContentSpy,
						getHeadReferenceForBranch: sinon.stub().returns(Promise.resolve('branchReferenceSHA'))
					};
				}
			});
			//action
			const createPRPromise = suggestionsController.createPullRequest(req, res);
			//assert
			createPRPromise.then(() => {
				assert(res.send.calledOnce);
				assert(res.status.calledOnce);
				assert.equal(res.status.firstCall.args[0], 500);
				assert(createContentSpy.notCalled);
				done();
			});
		});

		it('should return an error if content creation call returns an error (and not try to create a PR)', function (done) {
			//setup
			const createPullRequestSpy = sinon.spy();
			sinon.stub(suggestionsController, 'githubHelper', {
				get: () => {
					return {
						createReference: sinon.stub().returns(Promise.resolve({data: true})),
						createContent: sinon.stub().returns(Promise.reject({error: true})),
						createPullRequest: createPullRequestSpy,
						getHeadReferenceForBranch: sinon.stub().returns(Promise.resolve('branchReferenceSHA'))
					};
				}
			});
			//action
			const createPRPromise = suggestionsController.createPullRequest(req, res);
			//assert
			createPRPromise.then(() => {
				assert(createPullRequestSpy.notCalled);
				assert(res.status.calledOnce);
				assert(res.send.calledOnce);
				assert.equal(res.status.firstCall.args[0], 500);
				done();
			});
		});

		it('should return an error if pull request creation call returns an error', function (done) {
			//setup
			const githubHelperStub = {
				createReference: sinon.stub().returns(Promise.resolve({data: true})),
				createContent: sinon.stub().returns(Promise.resolve({data: true})),
				createPullRequest: sinon.stub().returns(Promise.resolve({error: true})),
				getHeadReferenceForBranch: sinon.stub().returns(Promise.resolve('branchReferenceSHA'))
			};
			sinon.stub(suggestionsController, 'githubHelper', {
				get: () => {
					return githubHelperStub;
				}
			});
			//action
			const createPRPromise = suggestionsController.createPullRequest(req, res);
			//assert
			createPRPromise.then(() => {
				assert(githubHelperStub.createPullRequest.calledOnce);
				assert(res.status.calledOnce);
				assert(res.send.calledOnce);
				assert.equal(res.status.firstCall.args[0], 500);
				done();
			});
		});

		it('should create a commit using the logged in user session data (username and email)', (done) => {
			//setup
			const githubHelperStub = {
				createReference: sinon.stub().returns(Promise.resolve({data: true})),
				createContent: sinon.stub().returns(Promise.reject({error: true})),
				createPullRequest: sinon.spy(),
				getHeadReferenceForBranch: sinon.stub().returns(Promise.resolve('branchReferenceSHA'))
			};
			sinon.stub(suggestionsController, 'githubHelper', {
				get: () => {
					return githubHelperStub;
				}
			});
			const customLudwig = Object.assign({}, req.ludwig, { committer: { name: 'committer name', email: 'committer@mail' }});
			const customReq = Object.assign({}, req, { ludwig: customLudwig });
			//action
			const createPRPromise = suggestionsController.createPullRequest(customReq, res);
			//assert
			createPRPromise.then(() => {
				assert(githubHelperStub.createContent.calledOnce);
				assert.deepEqual(githubHelperStub.createContent.getCall(0).args[5], customReq.ludwig.committer);

				done();
			});
		});

		it('should return an error if we cannot get a branch reference for specified branch', (done) => {
			//setup
			const githubHelperStub = {
				createReference: sinon.spy(),
				getHeadReferenceForBranch: sinon.stub().returns(Promise.reject({message: 'error getting references'}))
			};
			sinon.stub(suggestionsController, 'githubHelper', {
				get: () => {
					return githubHelperStub;
				}
			});
			//action
			const createPRPromise = suggestionsController.createPullRequest(req, res);
			//assert
			createPRPromise.then(() => {
				assert(res.status.calledOnce);
				assert(res.send.calledOnce);
				assert.deepEqual(res.status.firstCall.args[0], 500);
				assert(githubHelperStub.createReference.notCalled);
				done();
			});
		});

		it('should use the "not_master" branch to create pull requests for if branch "not_master" is specified', (done) => {
			//setup
			const suggestionsController = new SuggestionsController({ github: {
				branch: 'not_master',
				accessToken: ' accessToken',
				clientID: 'clientID',
				clientSecret: 'clientSecret'
			}});

			const githubHelperStub = {
				createReference: sinon.spy(),
				getHeadReferenceForBranch: sinon.stub().returns(Promise.reject({}))
			};
			sinon.stub(suggestionsController, 'githubHelper', {
				get: () => {
					return githubHelperStub;
				}
			});
			//action
			const createPRPromise = suggestionsController.createPullRequest(req, res);
			//assert
			createPRPromise.then(() => {
				assert.equal(githubHelperStub.getHeadReferenceForBranch.calledOnce, true);
				assert.deepEqual(githubHelperStub.getHeadReferenceForBranch.getCall(0).args, [ 'not_master' ]);

				done();
			});
		});
	});
});
