import express from 'express';
const router = express.Router();
import passport from 'passport';
import GithubStrategy from 'passport-github';
import {SuggestionsController} from '../controllers/suggestionsController';
const Strategy = GithubStrategy.Strategy;
import {TestsService} from '../services/testsService';
import moment from 'moment';

import config from '../ludwig-conf.js';
import mongoose from 'mongoose';
mongoose.connect(config.mongo.uri, config.mongo.options);

const testsService = new TestsService();

import {HistoryController} from '../controllers/historyController';
const historyController = new HistoryController();

passport.serializeUser((user, done) => {
	done(null, user);
});

passport.deserializeUser((obj, done) => {
	done(null, obj);
});

passport.use('github', new Strategy({
	clientID: process.env.npm_config_ludwig_clientID,
	clientSecret: process.env.npm_config_ludwig_clientSecret,
	callbackURL: config.github.authentication_callback
}, (accessToken, refreshToken, profile, done) => {
	profile.accessToken = accessToken;
	profile.refreshToken = refreshToken;
	return done(null, profile);
}));

// /test route not even declared if not explicitly enabled in configuration
if (process.env.NODE_ENV === 'development') {
	router.get('/test', (req, res) => {
		res.render('test');
	});
}

router.get('/createSuggestion',
	(req, res, next) => {
		req.session.title = req.query.title;
		req.session.description = req.query.description;
		req.session.state = req.query.state;
		next();
	},
	passport.authenticate('github', {scope: [ 'repo' ]}));

router.get('/github_callback', passport.authenticate('github', {failureRedirect: '/authKO'}), (req, res) => {
	const suggestionsController = new SuggestionsController();
	suggestionsController.createPullRequest(req.session.passport.user.accessToken, req.session.title, req.session.description, req.session.state, res);
});


router.get('/listTests', (req, res) => {
	testsService.getMostRecentTestSuite((err, mostRecentTestSuite) => {
		if(!err) {
			if(mostRecentTestSuite) {
				var date = new Date();
				date.setTime(mostRecentTestSuite.timestamp);
				res.render('listTests', {testSuite:mostRecentTestSuite, formattedTimestamp:moment(date).format('YYYY/MM/DD à HH:mm:ss')});
			} else {
				res.render('listTests', {testSuite:null});
			}
		} else {
			res.render('ko');
		}
	});
});

router.get('/history', (req, res) => {
	const testName = req.query.testName;
	historyController.collectTestHistoryDataForTest(testName, (err, dataToFeedToTemplateEngine) => {
		if(err) {
			res.render('ko');
		} else {
			res.render('testHistory', dataToFeedToTemplateEngine);
		}
	});
});

module.exports = router;
