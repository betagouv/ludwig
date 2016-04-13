'use strict';
var express = require('express'), path = require('path');
var session = require('express-session');
const MongoStore = require('connect-mongo')(session);
var passport = require('passport');
const appConfiguration = require('./ludwig-conf');
const mongoose = require('mongoose');
mongoose.connect(appConfiguration.mongo.uri, appConfiguration.mongo.options);

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var app = express();

var env = app.get('env');
var config = {
	port:env['NODE_PORT'] || 3000,
	ip:env['NODE_IP'] || 'localhost'
};
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, '/dist')));

if(!process.env.npm_config_ludwig_sessionSecret) {
	console.error('Session secret not defined! Ludwig server will not start until this is fixed!');
	process.exit(1);
}

app.use(session({
	secret: process.env.npm_config_ludwig_sessionSecret,
	resave:false,
	saveUninitialized:false,
	store:new MongoStore({mongooseConnection:mongoose.connection})
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(function(req, res, next) {
	res.header('Access-Control-Allow-Origin', process.env.npm_config_ludwig_AccessControlAllowOrigin);
	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
	next();
});

app.use('/', require('./routers/main'));

app.listen(config.port, config.ip, function () {
	console.log('Express server listening on %s:%d, in %s mode', config.ip, config.port, app.get('env'));
	if(process.env.NODE_ENV === 'development') {
		console.info('CAUTION : Test features are enabled. If you are trying to run a production instance, you should probably disable this by setting the appropriate environment (by setting the NODE_ENV environment variable to "production", for example)');
	}
});

module.exports = app;
