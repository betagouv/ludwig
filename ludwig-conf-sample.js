module.exports = {
    url: 'https://github.com/user/repo/new/master',
    template: 'some+basic+template+you+want',
    prefix: 'prefix for suggestions',
    commitReferenceToBranchFrom:'<commit sha1 reference from master to branch from>',
    github:{
        callback_url:'http://authentication.callback.url/for/github/login',
        apiEndpoints:{
            createRef:'https://api.github.com/repos/user/repo/git/refs',
            createContent:'https://api.github.com/repos/user/repo/contents/',
            createPullRequest:'https://api.github.com/repos/user/repo/pulls'
        }
    },
    web: {
        accepted_tests_path: '/tree/master/tests',
        add_path: '/new/master',
        suggested_tests_path: '/pulls?utf8=✓&q=is%3Apr+is%3Aopen'
    }
};
