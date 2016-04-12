import mongoose from 'mongoose';
const TestCaseModel = mongoose.model('TestCase', {
	name: String,
	status: String,
	timestamp: String,
	url: String,
	location: String,
	message: String,
	time: Number,
	author: {name:String, email:String}
});
export {TestCaseModel};