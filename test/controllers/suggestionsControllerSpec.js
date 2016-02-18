'use strict';
import {assert} from 'chai';
import sinon from 'sinon';
import SuggestionsController from '../../controllers/suggestionsController';

describe('suggestionController', () => {
    var suggestionsController;
    beforeEach(function () {
        suggestionsController = new SuggestionsController();
    });
    describe('createPullRequest', () => {
        it('should render the ok page if all remote calls work without errors', () => {
            //setup
            var res = {render: sinon.spy()};
            var accessToken = 'access token', title = 'title', description = 'description';
            var mockedGithubHelper = {
                createReference: (accessToken, newBranchName, commitReferenceToBranchFrom, callback) => {
                    callback(null, {});
                },
                createCommit: (accessToken, testFileName, newBranchName, description, base64FileContents, callback) => {
                    callback(null, {});
                },
                createPullRequest: (newBranchName, title, description, accessToken, callback) => {
                    callback(null, {body: {url: 'API URL for pull request', html_url: 'HTML URL for pull request'}});
                }
            };
            var state = 'some custom data so that b64 keeps quiet';
            sinon.stub(suggestionsController, 'githubHelper').returns(mockedGithubHelper);
            //action
            suggestionsController.createPullRequest(accessToken, title, description, state, res);
            //assert
            assert.equal(res.render.calledOnce, true);
            assert.deepEqual(res.render.getCall(0).args, ['ok', {pullRequestURL: 'HTML URL for pull request'}]);
        });

        var paramsCombinationsWithMissingParams = [
            {
                title: 'accessToken is',
                data:{}
            },
            {
                title:'title is',
                data:{
                    accessToken:'accessToken'
                }
            },
            {
                title:'description is',
                data:{
                    accessToken:'accessToken',
                    title:'title'
                }
            },
            {
                title:'state is',
                data:{
                    accessToken:'accessToken',
                    title:'title',
                    description:'description'
                }
            }
        ];

        paramsCombinationsWithMissingParams.forEach(function(testCase){
           it(`should return an error if ${testCase.title} missing`, function(){
               //setup
               var res = {render: sinon.spy()};
               var testData = testCase.data;
               //action
               suggestionsController.createPullRequest(testData.accessToken, testData.title, testData.description, testData.state, res);
               //assert
               assert.equal(res.render.calledOnce, true);
               assert.deepEqual(res.render.getCall(0).args, ['ko']);
           });
        });
    });
});