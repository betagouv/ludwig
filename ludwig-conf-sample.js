module.exports = {
	repository: 'github-user/repository',
	acceptedTestsLocation:'/tree/master/tests',
	github:{
		branchToCreatePullRequestsFor:'master',
		authenticationCallback:'http://authentication.callback.url/github_callback'
	},
	mongo:{
		uri:'mongodb://host/database-name',
		options:{}
	}
};
