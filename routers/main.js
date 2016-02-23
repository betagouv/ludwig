import express from 'express';
const router = express.Router();
import https from 'https';
import passport from 'passport';
import GithubStrategy from 'passport-github';
import {SuggestionsController} from '../controllers/suggestionsController'
const Strategy = GithubStrategy.Strategy;

const config = require('../ludwig-conf.js');

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((obj, done) => {
    done(null, obj);
});

passport.use('github', new Strategy({
    clientID: config.github.client_id,
    clientSecret: config.github.client_secret,
    callbackURL: config.github.authentication_callback
}, (accessToken, refreshToken, profile, done) => {
    profile.accessToken = accessToken;
    profile.refreshToken = refreshToken;
    return done(null, profile);
}));

// /test route not even declared if not explicitly enabled in configuration
if (config.testFeaturesEnabled) {
    router.get('/test', (req, res) => {
        res.render('test');
    });
}

router.get('/createSuggestion', (req, res, next) => {
        req.session.title = req.query.title;
        req.session.description = req.query.description;
        req.session.state = req.query.state;
        next();
    },
    passport.authenticate('github', {scope: ['repo']}));

router.get('/github_callback', passport.authenticate('github', {failureRedirect: '/authKO'}), (req, res) => {
    const suggestionsController = new SuggestionsController();
    suggestionsController.createPullRequest(req.session.passport.user.accessToken, req.session.title, req.session.description, req.session.state, res);
});

module.exports = router;
