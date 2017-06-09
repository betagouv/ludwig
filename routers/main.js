import bodyParser from 'body-parser';
import express from 'express';
import HistoryController from '../controllers/historyController';
import passport from 'passport';
import {SuggestionsController} from '../controllers/suggestionsController';
import ListTestsController from '../controllers/listTestsController';
import {passportStrategyFactory} from '../helpers/passportStrategyHelper';

module.exports = (ludwigConfiguration) => {
	const router = express.Router();
	const suggestionsCtrl = new SuggestionsController(ludwigConfiguration);
	const bodyParserURLEncoded = bodyParser.urlencoded({ extended: false });

	passport.serializeUser((user, done) => {
		done(null, user);
	});

	passport.deserializeUser((obj, done) => {
		done(null, obj);
	});

	const callbackURLPrefix = 'http://' + ludwigConfiguration.ip + ':' + ludwigConfiguration.port + ludwigConfiguration.root + '/github_callback/';
	const CREATE_PR_STRATEGY_NAME = 'githubCreatePR';
	const CHECK_LOGIN_STRATEGY_NAME = 'githubLogin';
	passport.use(CREATE_PR_STRATEGY_NAME, passportStrategyFactory(ludwigConfiguration.github, callbackURLPrefix + 'createPR'));
	passport.use(CHECK_LOGIN_STRATEGY_NAME, passportStrategyFactory(ludwigConfiguration.github, callbackURLPrefix + 'login'));

	router.use((req, res, next) => {
		req.ludwig = {};
		next();
	});

	if (process.env.NODE_ENV === 'development') {
		router.get('/test', (req, res) => {
			res.render('test', { root: ludwigConfiguration.root });
		});
	}

	function storeQueryTestSuggestionInSession(req, res, next) {
		req.session.testSuggestion = {
			title: req.query.title,
			description: req.query.description,
			state: req.query.state,
		};
		next();
	}

	function extractTestSuggestion(sourceFn, destFn) {
		return (req, res, next) => {
			const source = sourceFn(req);
			destFn(req).testSuggestion = {
				description: source.description,
				state: source.state,
				title: source.title,
			};
			next();
		};
	}

	function storePassportUserInRequest(req, res, next) {
		req.ludwig.user = req.session.passport.user;
		next();
	}

	const extractTestSuggestionToSession = (sourceFn) =>
	{
		return extractTestSuggestion(sourceFn, (req) => req.session);
	};

	function storeSessionTestSuggestionInRequest(req, res, next) {
		req.ludwig.testSuggestion = req.session.testSuggestion;
		next();
	}

	router.get('/createSuggestion',
		extractTestSuggestionToSession((req) => req.query),
		passport.authenticate(CREATE_PR_STRATEGY_NAME, {scope: [ 'repo' ]})
	);

	router.post('/createSuggestion',
		bodyParserURLEncoded,
		extractTestSuggestionToSession((req) => req.body),
		passport.authenticate(CREATE_PR_STRATEGY_NAME, {scope: [ 'repo' ]})
	);

	router.get('/github_callback/createPR',
		passport.authenticate(CREATE_PR_STRATEGY_NAME, {failureRedirect: '/authKO'}),
		storePassportUserInRequest,
		storeSessionTestSuggestionInRequest,
		suggestionsCtrl.createPullRequest,
		(req, res) => res.render('ok', { pullRequestURL: req.ludwig.pullRequest.html_url })
	);

	router.post('/anon/tests/suggestions', bodyParser.json(),
		extractTestSuggestion((req) => req.body, (req) => req.ludwig),
		suggestionsCtrl.createPullRequest,
		(req, res) => res.send(req.ludwig.pullRequest)
	);

	router.get('/github_callback/login',
		passport.authenticate(CHECK_LOGIN_STRATEGY_NAME, {failureRedirect: '/authKO'}),
		storePassportUserInRequest,
		(req, res) => res.redirect('/listTestsConnected')
	);

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
