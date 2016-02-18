var assert = require('chai').assert;
var sinon = require('sinon');
var GithubHelper = require('../../helpers/githubHelper');
var request = require('superagent');

describe('Github Helper', function () {
    let githubHelper;
    let config = [{
        pattern: 'https://api.github.com/(.*)',
        post: function (match, data) {
            return data;
        },
        put: function (match, data) {
            return data;
        },
        fixtures: function (match) {
            if (match[1] === 'repos/hoshin/git-api-tests/pulls') {
                console.log('hit the mocked PR endpoint');
                return {
                    'url': 'https://api.github.com/repos/hoshin/git-api-tests/pulls/19'
                };
            }

            if (match[1].match(/repos\/hoshin\/git-api-tests\/contents\/.*/)) {
                console.log('hit the mocked commit endpoint');
                return {};

            }

            if (match[1] === 'repos/hoshin/git-api-tests/git/refs') {
                console.log('hit the mocked ref creation endpoint');
                return {};
            }
            return {};
        }
    }];

    beforeEach(function () {
        githubHelper = new GithubHelper();
    });

    describe('createPullRequest', function () {
        it('should send an OK response if pull request was created on configured repo', function () {
            //setup
            var superagentMock = require('superagent-mock')(request, config);
            sinon.stub(githubHelper, 'agent').returns(request);
            var head = 'head', title = 'PR title', body = 'PR body', accessToken = 'access token 12434', callback = sinon.spy();
            //action
            githubHelper.createPullRequest(head, title, body, accessToken, callback);
            //assert
            assert.equal(callback.calledOnce, true);

            assert.deepEqual(callback.getCall(0).args[1], {
                'url': 'https://api.github.com/repos/hoshin/git-api-tests/pulls/19'
            });
            superagentMock.unset();
        });
    });
    describe('createPullRequestRequestBody', function () {
        it('should generate a correctly constructed pull request request body', function () {
            //setup
            var head = 'submitterBranch', title = 'PR title', body = 'PR body';
            //action
            var actual = githubHelper.createPullRequestRequestBody(head, title, body);
            //assert
            assert.equal(actual, '{"head":"refs/heads/submitterBranch", "base":"master", "title":"PR title", "body":"PR body"}');
        });
    });

    describe('createCommitRequestBody', function () {
        it('should generate a correctly constructed commit request body', function () {
            //setup
            var suggestionFileName = 'path for the suggestion file', branchName = 'branch to commit to', commitMessage = 'commit message', base64FileContents = 'Base64 Contents';
            //action
            var actual = githubHelper.createCommitRequestBody(suggestionFileName, branchName, commitMessage, base64FileContents);
            //assert
            assert.equal(actual, '{"path":"path for the suggestion file", "branch":"branch to commit to", "message":"commit message", "content":"Base64 Contents"}');
        });
    });

    describe('createReferenceRequestBody', function(){
        it('should generate a correctly constructed reference creation request body', function(){
            //setup
            var newBranchName='newBranchName', commitReferenceToBranchFrom='commit sha1 reference to branch from';
            //action
            var actual = githubHelper.createReferenceRequestBody(newBranchName, commitReferenceToBranchFrom);
            //assert
            assert.equal(actual, `{"ref":"refs/heads/newBranchName", "sha":"commit sha1 reference to branch from"}`);
        });
    });
});
