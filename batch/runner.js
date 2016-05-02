import {TestResultsCollector} from './testResultsCollector';
import ludwigConfiguration from '../ludwig-conf';
import mongoose from 'mongoose';

import fs from 'fs';

const collector = new TestResultsCollector(ludwigConfiguration);
mongoose.connect(ludwigConfiguration.mongo.uri, ludwigConfiguration.mongo.options);

const filePath = process.argv[2];
if (filePath) {
	fs.stat(filePath, (err, stat)  => {
		if (!err && stat.isFile()) {
			collector.saveFromXUnitData(filePath).then( () => {
				console.log('Data inserted!');
				process.exit(0);
			}).catch( (err) => {
				console.error('Something wrong happened');
				console.error(err);
				process.exit(1);
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
