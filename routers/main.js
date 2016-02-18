var express = require('express');
var router = express.Router();
var https = require('https');
var passport = require('passport');
var GithubStrategy = require('passport-github').Strategy;
var suggestionsController = new (require('../controllers/suggestionsController'))();

var config = require('../ludwig-conf.js');

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (obj, done) {
    done(null, obj);
});

passport.use('github', new GithubStrategy({
    clientID: config.github.client_id,
    clientSecret: config.github.client_secret,
    callbackURL: config.github.authentication_callback
}, function (accessToken, refreshToken, profile, done) {
    profile.accessToken = accessToken;
    profile.refreshToken = refreshToken;
    //maybe change @ some point if we want our own user DB (doubtful atm.)
    return done(null, profile);
}));

router.get('/test', function(req,res){
    res.render('test');
});

router.get('/createSuggestion', function (req, res, next) {
        req.session.title = req.query.title;
        req.session.description = req.query.description;
        req.session.state = req.query.state;
        next();
    },
    passport.authenticate('github', {scope: ['repo']}));

router.get('/github_callback', passport.authenticate('github', {failureRedirect: '/authKO'}), function (req, res, next) {
    suggestionsController.createPullRequest(req.session.passport.user.accessToken, req.session.title, req.session.description, req.session.state, res);
});

module.exports = router;
