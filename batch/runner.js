import {TestResultsCollector} from './testResultsCollector';
import configuration from '../ludwig-conf';
import fs from 'fs';

const collector = new TestResultsCollector(configuration);

const filePath = process.argv[2];
if (filePath) {
	fs.stat(filePath, (err, stat)  => {
		if (!err && stat.isFile()) {
			collector.saveFromXUnitData(filePath, (err, data) => {
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
			console.error(`Path specified does not point to a file (${filePath})`);
			process.exit(1);
		}
	});

} else {
	console.log('You need to specify a file');
	console.log('Usage : babel-node runner.js <xunit_report.xml>');
	process.exit(1);
}
