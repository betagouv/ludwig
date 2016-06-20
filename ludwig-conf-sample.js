module.exports = {
	repo: 'github-user/repository',
	acceptedTestsLocation: '/',
	accessControlAllowOrigin: 'http://localhost:3000',
	github: {
		branch: 'master',
		authenticationCallback: 'http://authentication.callback.url/github_callback'
	},
	mongo: {
		uri: 'mongodb://host/database-name',
		options: {}
	}
};
