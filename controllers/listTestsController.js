import ludwigDAO from '../database/ludwigDAO';

import moment from 'moment';


module.exports.showLatestTestSuite = function (userIdFilter, callback) {
	ludwigDAO.getTestHistoryFilteredByName(userIdFilter)
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

module.exports.isFilterMine = function (filterName, sessionData) {
	return (typeof(sessionData) !== 'undefined' && sessionData !== null && filterName === 'mine' && sessionData.user.id.length > 0);
};

module.exports.authenticateToFilterMyTests = function (res, next) {
	if (res.req.session.passport) {
		return res.redirect('/listTests?filter=mine');
	}

	next();
};
