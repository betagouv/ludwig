/*global describe it beforeEach*/
import {assert} from 'chai';
import sinon from 'sinon';
import {SuggestionsController} from '../../controllers/suggestionsController';

describe('suggestionController', () => {
	let suggestionsController;
	beforeEach(() => {
		suggestionsController = new SuggestionsController({});
	});
	describe('createPullRequest', () => {
		const testData = {
			accessToken: 'accessToken',
			title: 'title',
			description: 'description',
			state: 'state'
		};
		let res = {render:sinon.spy()};
		beforeEach( ()=> {
			res = {render:sinon.spy()};
		});

		it('should render the ok page if all remote calls work without errors', () => {
			//setup
			const accessToken = 'access token', title = 'title', description = 'description';
			const mockedGithubHelper = {
				createReference: sinon.stub().yields(null, {}),
				createContent: sinon.stub().yields(null, {}),
				createPullRequest: sinon.stub().yields(null, {body: {url: 'API URL for pull request', html_url: 'HTML URL for pull request'}}),
				getHeadReferenceForBranch: sinon.stub().yields(null, 'branchReferenceSHA')
			};
			const state = 'some custom data so that b64 keeps quiet';
			sinon.stub(suggestionsController, 'githubHelper').returns(mockedGithubHelper);
			//action
			suggestionsController.createPullRequest(accessToken, title, description, state, res);
			//assert
			assert.equal(res.render.calledOnce, true);
			assert.equal(mockedGithubHelper.createReference.calledOnce, true);
			assert.equal(mockedGithubHelper.createPullRequest.calledOnce, true);
			assert.equal(mockedGithubHelper.createContent.calledOnce, true);
			assert.equal(mockedGithubHelper.getHeadReferenceForBranch.calledOnce, true);
			assert.deepEqual(res.render.getCall(0).args, [ 'ok', {pullRequestURL: 'HTML URL for pull request'} ]);
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
				const testData = testCase.data;
				//action
				suggestionsController.createPullRequest(testData.accessToken, testData.title, testData.description, testData.state, res);
				//assert
				assert.equal(res.render.calledOnce, true);
				assert.deepEqual(res.render.getCall(0).args, [ 'ko' ]);
			});
		});

		it('should return an error if reference creation call returns an error (and not try to create content)', function () {
			//setup
			const createContentSpy = sinon.spy();
			sinon.stub(suggestionsController, 'githubHelper').returns({
				createReference: sinon.stub().yields({error: true}),
				createContent: createContentSpy,
				getHeadReferenceForBranch: sinon.stub().yields(null, 'branchReferenceSHA')
			});
			//action
			suggestionsController.createPullRequest(testData.accessToken, testData.title, testData.description, testData.state, res);
			//assert
			assert.equal(res.render.calledOnce, true);
			assert.equal(createContentSpy.called, false);
			assert.deepEqual(res.render.getCall(0).args, [ 'ko' ]);
		});

		it('should return an error if content creation call returns an error (and not try to create a PR)', function () {
			//setup
			const createPullRequestSpy = sinon.spy();
			sinon.stub(suggestionsController, 'githubHelper').returns({
				createReference: sinon.stub().yields(null, {data: true}),
				createContent: sinon.stub().yields({error:true}),
				createPullRequest:createPullRequestSpy,
				getHeadReferenceForBranch: sinon.stub().yields(null, 'branchReferenceSHA')
			});
			//action
			suggestionsController.createPullRequest(testData.accessToken, testData.title, testData.description, testData.state, res);
			//assert
			assert.equal(res.render.calledOnce, true);
			assert.equal(createPullRequestSpy.called, false);

			assert.deepEqual(res.render.getCall(0).args, [ 'ko' ]);
		});

		it('should return an error if pull request creation call returns an error', function () {
			//setup
			const githubHelperStub = {
				createReference: sinon.stub().yields(null, {data: true}),
				createContent: sinon.stub().yields(null, {data: true}),
				createPullRequest: sinon.stub().yields({error: true}),
				getHeadReferenceForBranch: sinon.stub().yields(null, 'branchReferenceSHA')
			};
			sinon.stub(suggestionsController, 'githubHelper').returns(githubHelperStub);
			//action
			suggestionsController.createPullRequest(testData.accessToken, testData.title, testData.description, testData.state, res);
			//assert
			assert.equal(res.render.calledOnce, true);
			assert.equal(githubHelperStub.createPullRequest.calledOnce, true);

			assert.deepEqual(res.render.getCall(0).args, [ 'ko' ]);
		});

		it('should return an error if we cannot get a branch reference for specified branch', () => {
			//setup
			const githubHelperStub = {
				createReference: sinon.spy(),
				getHeadReferenceForBranch: sinon.stub().yields({message:'error getting references'})
			};
			sinon.stub(suggestionsController, 'githubHelper').returns(githubHelperStub);
			//action
			suggestionsController.createPullRequest(testData.accessToken, testData.title, testData.description, testData.state, res);
			//assert
			assert.equal(res.render.calledOnce, true);
			assert.equal(githubHelperStub.createReference.called, false);

			assert.deepEqual(res.render.getCall(0).args, [ 'ko' ]);
		});

	});
});