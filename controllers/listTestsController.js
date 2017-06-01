import ludwigDAO from '../database/ludwigDAO';

import moment from 'moment';


module.exports.showLatestTestSuite = function (customUserFilter, callback) {
	ludwigDAO.getTestHistoryFilteredByUserData(customUserFilter)
		.then((mostRecentTestSuite) => {
			if (mostRecentTestSuite) {
				callback(null, {
					testSuite: mostRecentTestSuite,
					formattedTimestamp: moment(mostRecentTestSuite.timestamp).format('DD/MM/YYYY à HH:mm:ss')
				});
			} else {
				callback(null, {testSuite: null});
			}
		})
		.catch((err) => {
			callback(err);
		});
};

module.exports.authenticateToFilterMyTests = function (res, next) {
	if (res.req.session.passport) {
		let redirectTarget = '/listTests?filter=mine';
		if (res.req.query.testNameFilter) {
			redirectTarget+=`&testNameFilter=${res.req.query.testNameFilter}`;
		}
		return res.redirect(redirectTarget);
	}
	next();
};

module.exports.buildTestFilterForUser = function(sessionData) {
	const testFilterForUser = {};
	if (sessionData) {
		if (sessionData.login) {
			testFilterForUser.login = sessionData.login;
		}
		if (sessionData.name) {
			testFilterForUser.name = sessionData.name;
		}
		if (sessionData.email || sessionData.emails) {
			const multipleMails = sessionData.emails || [];
			testFilterForUser.emails = [  ].concat(sessionData.email, multipleMails.map( (emailElement) => {return emailElement.value; })).filter( (element) => {return element != null;});
		}
	}
	return testFilterForUser;
};
