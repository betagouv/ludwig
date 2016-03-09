import {TestResultsCollector} from './testResultsCollector';

let configuration = {
	mongo: {
		uri: 'mongodb://localhost/ludwig',
		options: {}
	}
};

const collector = new TestResultsCollector(configuration);

if (process.argv[2]) {
	collector.saveFromXUnitData(process.argv[2], (err, data) => {
		if (err) {
			console.error('Something wrong happened');
			console.error(err);
			process.exit(1);
		} else {
			console.log('Data inserted!');
			process.exit(0);
		}
	});
} else {
	console.log('You need to specify a file');
	console.log('Usage : babel-node runner.js <xunit_report.xml>');
	process.exit(1);
}
