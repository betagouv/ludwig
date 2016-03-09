import mongoose from 'mongoose';
const TestCaseModel = mongoose.model('TestCase', {
	name: String,
	status: String,
	timestamp: String
});
export {TestCaseModel};