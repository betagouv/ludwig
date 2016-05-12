import {Strategy} from 'passport-github';

module.exports.passportStrategyFactory = (targetEndpoint) => {
	return new Strategy({
		clientID: process.env.npm_config_ludwig_clientID,
		clientSecret: process.env.npm_config_ludwig_clientSecret,
		callbackURL: targetEndpoint
	}, (accessToken, refreshToken, profile, done) => {
		profile.accessToken = accessToken;
		profile.refreshToken = refreshToken;
		return done(null, profile);
	});
};
