import ludwigDAO from '../database/ludwigDAO';


module.exports.collectTestHistoryDataForTest = function (testName, callback) {
	if (testName) {
		ludwigDAO.getTestHistoryByName(testName)
			.then((data) => {
				let testList = data;
				callback(null, {testURL: testList[0] && testList[0].url, testList, testName});
			})
			.catch((err) => {
				callback(err);
			});
	} else {
		callback({message: 'No test name'});
	}
};
