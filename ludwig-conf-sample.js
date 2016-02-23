module.exports = {
    url: 'https://github.com/user/repo/new/master',
    template: 'some+basic+template+you+want',
    prefix: 'prefix for suggestions',
    testFeaturesEnabled:false,
    cors:{
        "Access-Control-Allow-Origin":'http://you.should.probably.edit.this/*'
    },
    commitReferenceToBranchFrom:'<commit sha1 reference from master to branch from>',
    github:{
        client_id:'<app client ID>',
        client_secret:'<app client secret>',
        callback_url:'http://authentication.callback.url/for/github/login',
        apiEndpoints:{
            createRef:'https://api.github.com/repos/user/repo/git/refs',
            createCommit:'https://api.github.com/repos/user/repo/contents/',
            createPullRequest:'https://api.github.com/repos/user/repo/pulls'
        }
    }
};
