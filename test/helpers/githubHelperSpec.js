import {assert} from 'chai';
import sinon from 'sinon';
import {GithubHelper} from '../../helpers/githubHelper';
import request from 'superagent';

describe('Github Helper', () => {
    let githubHelper;
    const config = [{
        pattern: 'https://api.github.com/(.*)',
        post: (match, data) => {
            return data;
        },
        put: (match, data) => {
            return data;
        },
        fixtures: (match) => {
            if (match[1] === 'repos/hoshin/git-api-tests/pulls') {
                return {
                    'url': 'https://api.github.com/repos/hoshin/git-api-tests/pulls/19'
                };
            }

            if (match[1].match(/repos\/hoshin\/git-api-tests\/contents\/.*/)) {
                return {};

            }

            if (match[1] === 'repos/hoshin/git-api-tests/git/refs') {
                return {};
            }
            return {};
        }
    }];

    beforeEach(() => {
        githubHelper = new GithubHelper();
    });

    describe('createPullRequest', () =>  {
        it('should send an OK response if pull request was created on configured repo', () =>  {
            //setup
            const superagentMock = require('superagent-mock')(request, config);
            sinon.stub(githubHelper, 'agent').returns(request);
            const head = 'head', title = 'PR title', body = 'PR body', accessToken = 'access token 12434', callback = sinon.spy();
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
    describe('createPullRequestRequestBody', () =>  {
        it('should generate a correctly constructed pull request request body', () =>  {
            //setup
            const head = 'submitterBranch', title = 'PR title', body = 'PR body';
            //action
            const actual = githubHelper.createPullRequestRequestBody(head, title, body);
            //assert
            assert.equal(actual, '{"head":"refs/heads/submitterBranch", "base":"master", "title":"PR title", "body":"PR body"}');
        });
    });

    describe('createContentRequestBody', () =>  {
        it('should generate a correctly constructed commit request body', () =>  {
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
            const newBranchName='newBranchName', commitReferenceToBranchFrom='commit sha1 reference to branch from';
            //action
            const actual = githubHelper.createReferenceRequestBody(newBranchName, commitReferenceToBranchFrom);
            //assert
            assert.equal(actual, `{"ref":"refs/heads/newBranchName", "sha":"commit sha1 reference to branch from"}`);
        });
    });
});
