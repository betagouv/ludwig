/*global describe it*/
import {assert} from 'chai';
import sinon from 'sinon';
import ludwigDAO from '../../database/ludwigDAO';
import {TestSuiteModel} from '../../database/models/testSuiteModel';
import {TestCaseModel} from '../../database/models/testCaseModel';

describe('Ludwig DAO', () => {
	it('should return a resolved promise if DAO saves both test suite and test cases without errors', (done) => {
		//setup
		sinon.stub(TestSuiteModel.prototype, 'save').yields(null, {saved:'data'});
		TestCaseModel.collection = {insert:sinon.stub().yields(null, [])};
		//action
		ludwigDAO.saveCompleteTestSuite({testCases:[]})
			.then( (data) => {
				//assert
				TestSuiteModel.prototype.save.restore();
				assert.deepEqual(data, {saved:'data'});
				done();
			})
			.catch( (err) => {
				TestSuiteModel.prototype.save.restore();
				done(err);
			});
	});

	it('should return a rejected promise if test suite save fails', (done) => {
		//setup
		sinon.stub(TestSuiteModel.prototype, 'save').yields(new Error('test suite save failed'));
		//action
		ludwigDAO.saveCompleteTestSuite({})
			.then( () => {
				TestSuiteModel.prototype.save.restore();
				done(new Error('ludwigDAO should return a rejected promise if test suite save fails'));
			})
			.catch( (err) => {
				//assert
				assert.equal(err.message, 'test suite save failed');
				TestSuiteModel.prototype.save.restore();
				done();
			});
	});

	it('should return an rejected promise if testCase collection for test suite fails', (done) => {
		//setup
		sinon.stub(TestSuiteModel.prototype, 'save').yields(null, {saved:'data'});
		TestCaseModel.collection = {insert:sinon.stub().yields(new Error('test cases save failed'))};
		//action
		ludwigDAO.saveCompleteTestSuite({})
			.then(() => {
				TestSuiteModel.prototype.save.restore();
				done(new Error('should reject if we cannot save test cases collection'));
			})
			.catch( (err) => {
				//assert
				TestSuiteModel.prototype.save.restore();
				assert.equal(err.message, 'test cases save failed');
				done();
			} );
	});

	it('should return an rejected promise if test suite update fails', (done) => {
		//setup
		const saveStub = sinon.stub(TestSuiteModel.prototype, 'save');
		saveStub.onFirstCall().yields(null, {saved:'data'});
		saveStub.onSecondCall().yields(new Error('test suite update failed'));
		TestCaseModel.collection = {insert:sinon.stub().yields(null, {})};
		//action
		ludwigDAO.saveCompleteTestSuite({})
			.then(() => {
				TestSuiteModel.prototype.save.restore();
				done(new Error('should reject if we cannot update test suite'));
			})
			.catch( (err) => {
				//assert
				TestSuiteModel.prototype.save.restore();
				assert.equal(err.message, 'test suite update failed');
				done();
			} );
	});
	//cleanup ? transaction? concaténation d'opérations?
});
