import mongoose from 'mongoose';
const TestCaseModel = mongoose.model('TestCase', {
	name: String,
	status: String,
	timestamp: String,
	location:String
});
export {TestCaseModel};