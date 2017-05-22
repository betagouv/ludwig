'use strict';
import appConfiguration from './ludwig-conf';

const app = require('.')(appConfiguration);

app.listen(appConfiguration.port, appConfiguration.ip, function () {
	console.log('Express server listening on %s:%d, in %s mode', appConfiguration.ip, appConfiguration.port, app.get('env'));
	if (process.env.NODE_ENV === 'development') {
		console.info('CAUTION : Test features are enabled. If you are trying to run a production instance, you should probably disable this by setting the appropriate environment (by setting the NODE_ENV environment variable to "production", for example)');
	}
});

module.exports = app;
