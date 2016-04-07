import mongoose from 'mongoose';
const TestCaseModel = mongoose.model('TestCase', {
	name: String,
	status: String,
	timestamp: String,
	location:String,
	message:String,
	time:Number
});
export {TestCaseModel};
