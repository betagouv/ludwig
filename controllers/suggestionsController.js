import GithubHelper from '../helpers/githubHelper';
const FILE_NAME_PREFIX = 'suggestion';
const BRANCH_PREFIX = 'suggestion';
const _githubHelper = new GithubHelper();
import config from '../ludwig-conf';

class SuggestionsController {
    constructor() {
    }

    githubHelper(){
        return _githubHelper;
    }
    /*
     This function chains 3 github API calls in order to create a pull request
     Right now this lacks error management (it assumes everything goes well from one call to another ... which will probably not be the case at the start)
        @param accessToken: A valid accessToken to access the github API
        @param title: (string) Will be used as a title for the pull request creation
        @param state: (urlencoded JSON string) The state we want to record
        @param res: An expressjs Response object to get back to the user
    */
    createPullRequest(accessToken, title, description, state, res) {
        const self = this;
        const now = (new Date()).getTime();
        const newBranchName = BRANCH_PREFIX + now;
        const commitReferenceToBranchFrom = config.commitReferenceToBranchFrom;

        if(necessaryPullRequestDataIsDefinedAndNotEmpty(accessToken, title, description, state)) {
            self.githubHelper().createReference(accessToken, newBranchName, commitReferenceToBranchFrom, (err, newRefData) => {
                const testFileName = FILE_NAME_PREFIX + now + '.txt';
                const stateStringBuffer = new Buffer(state);
                const base64FileContents = stateStringBuffer.toString('base64');//contenu du state? ou state + template?
                self.githubHelper().createCommit(accessToken, testFileName, newBranchName, description, base64FileContents, (err, newCommitData) => {
                    self.githubHelper().createPullRequest(newBranchName, title, description, accessToken, (err, newPullRequestData) => {
                        res.render('ok', {pullRequestURL: newPullRequestData.body.html_url});
                    })
                })
            });
        } else {
            res.render('ko');
        }
    }
}

/*
* Checks whether the pull request creation call lacks mandatory data or not
* */
let necessaryPullRequestDataIsDefinedAndNotEmpty = (accessToken, title, description, state) =>{
    return accessToken && title && description && state;
};

export {SuggestionsController};