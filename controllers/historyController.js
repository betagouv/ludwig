import {TestsService} from '../services/testsService';

class HistoryController {
	constructor(configuration) {
		this.config = configuration;
	}

	getTestsService() {
		if (!this.testsService) {
			this.testsService = new TestsService(this.config.mongo);
		}
		return this.testsService;
	}

	collectTestHistoryDataForTest(testName, callback) {
		if (testName) {
			this.getTestsService().getTestHistoryByName(testName, (err, data) => {
				let testList = [];
				if (!err) {
					testList = data;
				}
				const location = testList[0] ? testList[0].location : 'N/A';
				callback(null, {testLocation: location, testList: testList, testName: testName});
			});
		} else {
			callback({message:'No test name'});
		}
	}
}

export {HistoryController};
