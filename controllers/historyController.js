import {TestsService} from '../services/testsService';
import config from '../ludwig-conf.js';

class HistoryController {
	constructor() {
	}

	getTestsService() {
		if(!this.testsService) {
			this.testsService = new TestsService(config.mongo);
		}
		return this.testsService;
	}

	collectTestHistoryDataForTest(testName, callback) {
		if(testName) {
			this.getTestsService().getTestHistoryByName(testName, (err, data) => {
				let testList = [];
				if (!err) {
					testList = data;
				}
				
				callback(null, {testURL: testList[0] && testList[0].url, testList: testList, testName: testName});
			});
		} else {
			callback({message:'No test name'});
		}
	}
}

export {HistoryController};
