var GithubHelper = require('../helpers/githubHelper');
var FILE_NAME_PREFIX = 'suggestion';
var BRANCH_PREFIX = 'suggestion';
var _githubHelper = new GithubHelper();
var config = require('../ludwig-conf');

var SuggestionsController = function () {
};

SuggestionsController.prototype.githubHelper = function(){
    return _githubHelper;
};

/*
 This function chains 3 github API calls in order to create a pull request
 Right now this lacks error management (it assumes everything goes well from one call to another ... which will probably not be the case at the start)
 */
function necessaryPullRequestDataIsDefinedAndNotEmpty(accessToken, title, description, state) {
    return accessToken && title && description && state;
}
SuggestionsController.prototype.createPullRequest = function (accessToken, title, description, state, res) {
    var self = this;
    var now = (new Date()).getTime();
    var newBranchName = BRANCH_PREFIX + now;
    var commitReferenceToBranchFrom = config.commitReferenceToBranchFrom;

    if(necessaryPullRequestDataIsDefinedAndNotEmpty(accessToken, title, description, state)) {
        self.githubHelper().createReference(accessToken, newBranchName, commitReferenceToBranchFrom, function (err, newRefData) {
            var testFileName = FILE_NAME_PREFIX + now + '.txt';
            var stateStringBuffer = new Buffer(state);
            var base64FileContents = stateStringBuffer.toString('base64');//contenu du state? ou state + template?
            self.githubHelper().createCommit(accessToken, testFileName, newBranchName, description, base64FileContents, function (err, newCommitData) {
                self.githubHelper().createPullRequest(newBranchName, title, description, accessToken, function (err, newPullRequestData) {
                    res.render('ok', {pullRequestURL: newPullRequestData.body.html_url});
                })
            })
        });
    } else {
        res.render('ko');
    }
};

module.exports = SuggestionsController;
