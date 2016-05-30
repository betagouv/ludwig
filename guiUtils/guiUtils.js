function filterByTestName(search, testName) {
	if (testName) {
		if (search) {
			if (!search.match(/.*testNameFilter=.*/)) {
				return search+='&testNameFilter='+testName;
			} else {
				return search.replace(/testNameFilter=[^&]*/, 'testNameFilter='+testName);
			}
		} else {
			return '?testNameFilter='+testName;
		}
	}
	return null;
}

module.exports.filterByTestName = filterByTestName;

function filterByMine(location) {
	if (location.search && !location.search.includes('filter=mine')) {
		return `${location.pathname}${location.search}&filter=mine`;
	} else {
		return '/listTestsConnected?filter=mine';
	}
}

module.exports.filterByMine = filterByMine;
