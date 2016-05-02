import express from 'express';
import HistoryController from '../controllers/historyController';
import ludwigConfiguration from '../ludwig-conf.js';
import passport from 'passport';
import {SuggestionsController} from '../controllers/suggestionsController';
import ListTestsController from '../controllers/listTestsController';
import {passportStrategyFactory} from '../helpers/passportStrategyHelper';

const router = express.Router();
const suggestionsController = new SuggestionsController(ludwigConfiguration);

passport.serializeUser((user, done) => {
	done(null, user);
});

passport.deserializeUser((obj, done) => {
	done(null, obj);
});

const CREATE_PR_STRATEGY_NAME = 'githubCreatePR';
const CHECK_LOGIN_STRATEGY_NAME = 'githubLogin';
passport.use(CREATE_PR_STRATEGY_NAME, passportStrategyFactory(ludwigConfiguration.github.authenticationCallback+'/createPR'));
passport.use(CHECK_LOGIN_STRATEGY_NAME, passportStrategyFactory(ludwigConfiguration.github.authenticationCallback+'/login'));

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
	passport.authenticate(CREATE_PR_STRATEGY_NAME, {scope: [ 'repo' ]}));

router.get('/github_callback/createPR', passport.authenticate(CREATE_PR_STRATEGY_NAME, {failureRedirect: '/authKO'}), (req, res) => {
	suggestionsController.createPullRequest(req.session.title, req.session.description, req.session.state, res);
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
	let userIdFilter;
	const myTestsOnly = isUserConnected(req.session.passport) && req.query['filter'] === 'mine';
	if (myTestsOnly) {
		userIdFilter = req.session.passport.user.id;
	}
	ListTestsController.showLatestTestSuite(userIdFilter, (err, renderParams) => {
		if (err) {
			res.render('ko');
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
			res.render('ko');
		} else {
			res.render('testHistory', dataToFeedToTemplateEngine);
		}
	});
});

module.exports = router;
