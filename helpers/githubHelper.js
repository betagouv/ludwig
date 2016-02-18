'use strict';
let superAgent = require('superagent');
let config = require('../ludwig-conf');

var GithubHelper = function(){};

GithubHelper.prototype.agent = function() {
    return superAgent;
};

GithubHelper.prototype.createPullRequestRequestBody = function(head, title, body){
    return `{"head":"refs/heads/${head}", "base":"master", "title":"${title}", "body":"${body}"}`;
};

GithubHelper.prototype.createCommitRequestBody = function(testFileName, branchName, commitMessage, base64FileContents){
    return `{"path":"${testFileName}", "branch":"${branchName}", "message":"${commitMessage}", "content":"${base64FileContents}"}`;
};

GithubHelper.prototype.createPullRequest = function(head, title, body, accessToken, callback) {
    this.agent()
        .post(config.github.apiEndpoints.createPullRequest)
        .send(this.createPullRequestRequestBody(head, title, body))
        .set('Authorization', `token ${accessToken}`)
        .end(function (err, dataToReturn) {
            callback(null, dataToReturn);
        });
};

GithubHelper.prototype.createCommit = function(accessToken, testFileName, branchName, commitMessage, base64FileContents, callback){
    this.agent()
        .put(`${config.github.apiEndpoints.createCommit}${testFileName}`)
        .send(this.createCommitRequestBody(testFileName, branchName, commitMessage, base64FileContents))
        .set('Authorization', `token ${accessToken}`)
        .end(function (err, createCommitResult) {
            callback(null, createCommitResult);
        });
};

GithubHelper.prototype.createReferenceRequestBody = function(newBranchName, commitReferenceToBranchFrom){
    return `{"ref":"refs/heads/${newBranchName}", "sha":"${commitReferenceToBranchFrom}"}`;
};

GithubHelper.prototype.createReference = function(accessToken, newBranchName, commitReferenceToBranchFrom, callback){
    this.agent()
        .post(config.github.apiEndpoints.createRef)
        .send(this.createReferenceRequestBody(newBranchName, commitReferenceToBranchFrom))
        .set('Authorization', `token ${accessToken}`)
        .end(function (err, createReferenceResult) {
            callback(null, createReferenceResult);
        });
};

module.exports = GithubHelper;