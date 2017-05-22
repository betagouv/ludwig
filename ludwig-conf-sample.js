module.exports = {
	acceptedTestsLocation:'/',
	cors: 'CORS Allow-Origin - list all domains that will use this instance',
	github: {
		accessToken: 'From https://help.github.com/articles/creating-an-access-token-for-command-line-use/',
		branch: 'master',
		clientID: 'Github API ClientID - result from https://github.com/settings/applications/new',
		clientSecret: 'Github API ClientSecret - result from https://github.com/settings/applications/new',
	},
	ip: 'localhost',
	mongo: {
		uri: 'mongodb://host/database-name',
		options: {}
	},
	port: 3000,
	repo: 'github-user/repository',
	session: {
		secret: 'Application session secret? (arbitrary, used for session authentication)',
	},
};
