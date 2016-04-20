import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const TestSuiteModel = mongoose.model('TestSuite', {
	name: String,
	failures: Number,
	timestamp: {type:String, unique:true},
	testCases: [ { type: Schema.Types.ObjectId, ref: 'TestCase' } ]
});


export {TestSuiteModel};
