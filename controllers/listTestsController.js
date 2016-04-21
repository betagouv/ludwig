import ludwigDAO from '../database/ludwigDAO';

import moment from 'moment';


module.exports.showLatestTestSuite = function (userIdFIlter, callback) {
	ludwigDAO.getTestHistoryFilteredByName(userIdFIlter)
		.then((mostRecentTestSuite) => {
			if (mostRecentTestSuite) {
				var date = new Date();
				date.setTime(mostRecentTestSuite.timestamp);
				callback(null, {
					testSuite: mostRecentTestSuite,
					formattedTimestamp: moment(date).format('DD/MM/YYYY à HH:mm:ss')
				});
			} else {
				callback(null, {testSuite: null});
			}
		})
		.catch((err) => {
			callback(err);
		});
};

module.exports.filterMine = function (filterName, sessionData) {
	return (typeof(sessionData) !== 'undefined' && sessionData !== null && filterName === 'mine' && sessionData.user.id.length > 0);
};
