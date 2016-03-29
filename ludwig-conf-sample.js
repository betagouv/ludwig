module.exports = {
	repository: 'github-user/repository',
	ludwigCreateSuggestionURL: 'http://localhost:3000/createSuggestion',
	acceptedTestsLocation:'/tree/master/tests',
	github:{
		branchToCreatePullRequestsFor:'<commit sha1 reference from master to branch from>',
		authenticationCallback:'http://authentication.callback.url/for/github/login'
	},
	mongo:{
		uri:'mongodb://host/database-name',
		options:{}
	}
};
