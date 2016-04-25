/*global describe it*/
import ListTestsController from '../../controllers/listTestsController';
import {assert} from 'chai';
import sinon from 'sinon';
import ludwigDAO from '../../database/ludwigDAO';

describe('ListTestsController', () => {
	describe('showLastTestSuite',  () => {
		it('should return a rejected promise if getting most recent test suite raised an error', () => {
			//setup
			sinon.stub(ludwigDAO, 'getTestHistoryFilteredByName').returns(Promise.reject({some:'error'}));
			//action
			ListTestsController.showLatestTestSuite(null, (err) => {
				//assert
				assert.deepEqual(err, {some:'error'} );
			});
			ludwigDAO.getTestHistoryFilteredByName.restore();

		});

		it('should resolve w/ an empty testSuite if getting most recent test suite returned nothing', () => {
			//setup
			sinon.stub(ludwigDAO, 'getTestHistoryFilteredByName').returns(Promise.resolve(null));

			//action
			ListTestsController.showLatestTestSuite(null, (err, data) => {
				//assert
				assert.deepEqual(data, {testSuite:null} );
			});
			ludwigDAO.getTestHistoryFilteredByName.restore();
		});

		it('should resolve w/ a valid testSuite if getting most recent test suite returned something', () => {
			//setup
			sinon.stub(ludwigDAO, 'getTestHistoryFilteredByName').returns(Promise.resolve({testCases:[], name:'foo bar baz', timestamp:0}));

			//action
			ListTestsController.showLatestTestSuite(null, (err, data) => {
				//assert
				assert.equal(err, null);
				assert.deepEqual(data.testSuite, {testCases:[], name:'foo bar baz', timestamp:0});
				assert.match(data.formattedTimestamp, /^01\/01\/1970 à [0-9]{2}:00:00$/);
			});
			ludwigDAO.getTestHistoryFilteredByName.restore();
		});
	});

	describe('isFilterMine', () => {
		it('should return false if query filter does not equal "mine"', () => {
			//setup
			//action
			const actual = ListTestsController.isFilterMine('hai');
			//assert
			assert.equal(actual, false);
		});
		it('should return true if passport data contains GitHUb id, and filter is "mine"', () => {
			//setup
			//action
			const actual = ListTestsController.isFilterMine('mine', {user:{id:'1234'}});
			//assert
			assert.equal(actual, true);
		});
		it('should return false if passport data is null, even if filter is "mine"', () => {
			//setup
			//action
			const actual = ListTestsController.isFilterMine('mine', null);
			//assert
			assert.equal(actual, false);
		});
	});

	describe('authenticateToFilterMyTests', () => {
		it('should redirect to "/listTEsts?filter=mine" if passport session data is defined', () => {
			//setup
			const res = {redirect:sinon.spy(), req:{session:{passport:{}}}};
			//action
			ListTestsController.authenticateToFilterMyTests(res);
			//assert
			assert.equal(res.redirect.calledOnce, true);
			assert.equal(res.redirect.getCall(0).args[0], '/listTEsts?filter=mine');
		});

		it('should move on to the authentication middleware is no passport session data exists', () => {
			//setup
			const res = {redirect:sinon.spy(), req:{session:{}}};
			const next = sinon.spy();
			//action
			ListTestsController.authenticateToFilterMyTests(res, next);
			//assert
			assert.equal(res.redirect.called, false);
			assert.equal(next.calledOnce, true);
		});
	});
});

