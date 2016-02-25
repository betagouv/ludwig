module.exports = {
	repo_url: 'https://github.com/user/repo',
	template: 'some+basic+template',
	prefix: 'prefix',
	expectedTemplate: '{\r\n\tdata:"123"\r\n\ttoBe:{\r\n\t\tused:1, \r\n\t\tas:"template for expected state"\r\n\t}\r\n}',
	web: {
		accepted_tests_path: '/tree/master/tests',
		add_path: '/new/master',
		suggested_tests_path: '/pulls?utf8=✓&q=is%3Apr+is%3Aopen'
	}
}
