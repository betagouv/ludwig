import {TestsService} from '../services/testsService';
const testsService = new TestsService();
import moment from 'moment';

class ListTestsController {
	constructor() {
	}

	get testsService() {
		return testsService;
	}
	showLatestTestSuite(userNameFilter, callback) {
		this.testsService.getMostRecentTestSuite(userNameFilter, (err, mostRecentTestSuite) => {
			if (!err) {
				if (mostRecentTestSuite) {
					var date = new Date();
					date.setTime(mostRecentTestSuite.timestamp);
					callback(null, {
						testSuite: mostRecentTestSuite,
						formattedTimestamp: moment(date).format('YYYY/MM/DD à HH:mm:ss')
					});
				} else {
					callback(null, {testSuite: null});
				}
			} else {
				callback(err);
			}
		});
	}

	filterMine(filterName, sessionData) {
		return (typeof(sessionData) !== 'undefined' && sessionData !== null && filterName === 'mine' && sessionData.user.displayName.length > 0);
	}
}

export {ListTestsController};
