import express from 'express';
const router = express.Router();
import passport from 'passport';
import GithubStrategy from 'passport-github';
import {SuggestionsController} from '../controllers/suggestionsController';
const Strategy = GithubStrategy.Strategy;

import config from '../ludwig-conf.js';

import {HistoryController} from '../controllers/historyController';
const historyController = new HistoryController();
import {ListTestsController} from '../controllers/listTestsController';
const listTestsController = new ListTestsController();


passport.serializeUser((user, done) => {
	done(null, user);
});

passport.deserializeUser((obj, done) => {
	done(null, obj);
});

passport.use('github', new Strategy({
	clientID: process.env.npm_config_ludwig_clientID,
	clientSecret: process.env.npm_config_ludwig_clientSecret,
	callbackURL: config.github.authenticationCallback
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
		req.session.originalUrl = '/createSuggestion';
		next();
	},
	passport.authenticate('github', {scope: [ 'repo' ]}));

router.get('/github_callback', passport.authenticate('github', {failureRedirect: '/authKO'}), (req, res) => {
	const suggestionsController = new SuggestionsController();
	if (req.session.originalUrl === '/createSuggestion') {
		suggestionsController.createPullRequest(process.env.npm_config_ludwig_accessToken, req.session.title, req.session.description, req.session.state, res, config.github.branchToCreatePullRequestsFor);
	} else {
		res.redirect(req.session.originalUrl);
	}
});

router.get('/listTestsConnected', (req, res, next) => {
	req.session.originalUrl = '/listTests?filter=mine';
	if(req.session.passport) {
		res.redirect('/listTests?filter=mine');
	} else {
		next();
	}
}, passport.authenticate('github', {scope: [ 'repo' ]}));


router.get('/listTests', (req, res) => {
	let nameFilter = null;
	const myTestsOnly = listTestsController.filterMine(req.query['filter'], req.session.passport);
	if (myTestsOnly) {
		nameFilter = req.session.passport.user.displayName;
	}
	listTestsController.showLatestTestSuite(nameFilter, (err, renderParams) => {
		if (!err) {
			renderParams.mine = myTestsOnly;
			res.render('listTests', renderParams);
		} else {
			res.render('ko');
		}
	});
});

router.get('/history', (req, res) => {
	const testName = req.query.testName;
	historyController.collectTestHistoryDataForTest(testName, (err, dataToFeedToTemplateEngine) => {
		if (err) {
			res.render('ko');
		} else {
			res.render('testHistory', dataToFeedToTemplateEngine);
		}
	});
});

module.exports = router;
