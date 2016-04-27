module.exports = {
	repo: 'github-user/repository',
	acceptedTestsLocation:'/',
	github:{
		branch:'master',
		authenticationCallback:'http://authentication.callback.url/github_callback'
	},
	mongo:{
		uri:'mongodb://host/database-name',
		options:{}
	}
};
