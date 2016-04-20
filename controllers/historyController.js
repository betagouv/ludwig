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

				callback(null, {testURL: testList[0] && testList[0].url, testList, testName});
			});
		} else {
			callback({message:'No test name'});
		}
	}
}

export {HistoryController};
