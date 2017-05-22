'use strict';
import express from 'express';
import session from 'express-session';
import store from 'connect-mongo';
import passport from 'passport';
import appConfiguration from './ludwig-conf';
import mongoose from 'mongoose';
import path from 'path';
import bodyParser from 'body-parser';

const MongoStore = store(session);

mongoose.connect(appConfiguration.mongo.uri, appConfiguration.mongo.options);

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const app = express();

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, '/dist')));
app.use(bodyParser.urlencoded({ extended: false }));

app.use(session({
	secret: appConfiguration.session.secret,
	resave:false,
	saveUninitialized:false,
	store:new MongoStore({mongooseConnection: mongoose.connection})
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(function(req, res, next) {
	res.header('Access-Control-Allow-Origin', appConfiguration.cors);
	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
	next();
});

app.use('/', require('./routers/main')(appConfiguration));

app.listen(appConfiguration.port, appConfiguration.ip, function () {
	console.log('Express server listening on %s:%d, in %s mode', appConfiguration.ip, appConfiguration.port, app.get('env'));
	if (process.env.NODE_ENV === 'development') {
		console.info('CAUTION : Test features are enabled. If you are trying to run a production instance, you should probably disable this by setting the appropriate environment (by setting the NODE_ENV environment variable to "production", for example)');
	}
});

module.exports = app;
