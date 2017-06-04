import express from 'express';
import HistoryController from '../controllers/historyController';
import passport from 'passport';
import {SuggestionsController} from '../controllers/suggestionsController';
import ListTestsController from '../controllers/listTestsController';
import {passportStrategyFactory} from '../helpers/passportStrategyHelper';

module.exports = (ludwigConfiguration) => {
	const router = express.Router();
	const suggestionsController = new SuggestionsController(ludwigConfiguration);

	passport.serializeUser((user, done) => {
		done(null, user);
	});

	passport.deserializeUser((obj, done) => {
		done(null, obj);
	});

	const callbackURLPrefix = 'http://' + ludwigConfiguration.ip + ':' + ludwigConfiguration.port + '/github_callback/';
	const CREATE_PR_STRATEGY_NAME = 'githubCreatePR';
	const CHECK_LOGIN_STRATEGY_NAME = 'githubLogin';
	passport.use(CREATE_PR_STRATEGY_NAME, passportStrategyFactory(ludwigConfiguration.github, callbackURLPrefix + 'createPR'));
	passport.use(CHECK_LOGIN_STRATEGY_NAME, passportStrategyFactory(ludwigConfiguration.github, callbackURLPrefix + 'login'));

	if (process.env.NODE_ENV === 'development') {
		router.get('/test', (req, res) => {
			res.render('test');
		});
	}

	router.get('/createSuggestion',
		(req, res, next) => {
			req.session.testSuggestion = {
				title: req.query.title,
				description: req.query.description,
				state: req.query.state,
			};
			next();
		},
		passport.authenticate(CREATE_PR_STRATEGY_NAME, {scope: [ 'repo' ]}));

	router.post('/createSuggestion',
		(req, res, next) => {
			req.session.testSuggestion = {
				title: req.body.title,
				description: req.body.description,
				state: req.body.state,
			};
			next();
		},
		passport.authenticate(CREATE_PR_STRATEGY_NAME, {scope: [ 'repo' ]}));

	router.get('/github_callback/createPR', passport.authenticate(CREATE_PR_STRATEGY_NAME, {failureRedirect: '/authKO'}), (req, res) => {
		suggestionsController.createPullRequest(req.session.testSuggestion, res);
	});

	router.get('/github_callback/login', passport.authenticate(CHECK_LOGIN_STRATEGY_NAME, {failureRedirect: '/authKO'}), (req, res) => {
		res.redirect('/listTestsConnected');
	});

	router.get('/', (req, res) => {
		res.redirect('/listTests');
	});

	function isUserConnected(sessionData) {
		return typeof(sessionData) !== 'undefined' && sessionData !== null && sessionData.user.id.length > 0;
	}

	router.get('/listTests', (req, res) => {
		let customUserFilter = {};
		const myTestsOnly = isUserConnected(req.session.passport) && req.query['filter'] === 'mine';
		if (myTestsOnly) {
			customUserFilter = ListTestsController.buildTestFilterForUser(req.session.passport.user._json);
		}
		ListTestsController.showLatestTestSuite(customUserFilter, (err, renderParams) => {
			if (err) {
				res.status(500).send(err);
			} else {
				renderParams.mine = myTestsOnly;
				res.render('listTests', renderParams);
			}
		});
	});

	router.get('/listTestsConnected', (req, res, next) => {
		ListTestsController.authenticateToFilterMyTests(res, next);
	}, passport.authenticate(CHECK_LOGIN_STRATEGY_NAME, {scope: [ 'repo' ]}));

	router.get('/history', (req, res) => {
		HistoryController.collectTestHistoryDataForTest(req.query.testName, (err, dataToFeedToTemplateEngine) => {
			if (err) {
				res.status(500).send(err);
			} else {
				res.render('testHistory', dataToFeedToTemplateEngine);
			}
		});
	});
	return router;
}
