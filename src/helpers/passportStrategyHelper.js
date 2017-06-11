import {Strategy} from 'passport-github';

module.exports.passportStrategyFactory = (config, targetEndpoint) => {
	return new Strategy({
		clientID: config.clientID,
		clientSecret: config.clientSecret,
		callbackURL: targetEndpoint
	}, (accessToken, refreshToken, profile, done) => {
		profile.accessToken = accessToken;
		profile.refreshToken = refreshToken;
		return done(null, profile);
	});
};
