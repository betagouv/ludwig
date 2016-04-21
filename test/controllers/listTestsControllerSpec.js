/*global describe it beforeEach*/

import {ListTestsController} from '../../controllers/listTestsController';
import {assert} from 'chai';
import sinon from 'sinon';
import ludwigDAO from '../../database/ludwigDAO';

describe('ListTestsController', () => {
	let listTestsController = null;
	beforeEach(() => {
		listTestsController = new ListTestsController();
	});

	describe('showLastTestSuite',  () => {
		it('should return a rejected promise if getting most recent test suite raised an error', () => {
			//setup
			sinon.stub(ludwigDAO, 'getTestHistoryFilteredByName').returns(Promise.reject({some:'error'}));
			//action
			listTestsController.showLatestTestSuite(null, (err) => {
				//assert
				assert.deepEqual(err, {some:'error'} );
			});
			ludwigDAO.getTestHistoryFilteredByName.restore();

		});

		it('should resolve w/ an empty testSuite if getting most recent test suite returned nothing', () => {
			//setup
			sinon.stub(ludwigDAO, 'getTestHistoryFilteredByName').returns(Promise.resolve(null));

			//action
			listTestsController.showLatestTestSuite(null, (err, data) => {
				//assert
				assert.deepEqual(data, {testSuite:null} );
			});
			ludwigDAO.getTestHistoryFilteredByName.restore();
		});

		it('should resolve w/ a valid testSuite if getting most recent test suite returned something', () => {
			//setup
			sinon.stub(ludwigDAO, 'getTestHistoryFilteredByName').returns(Promise.resolve({testCases:[], name:'foo bar baz', timestamp:0}));

			//action
			listTestsController.showLatestTestSuite(null, (err, data) => {
				//assert
				assert.equal(err, null);
				assert.deepEqual(data.testSuite, {testCases:[], name:'foo bar baz', timestamp:0});
				assert.match(data.formattedTimestamp, /^01\/01\/1970 à [0-9]{2}:00:00$/);
			});
			ludwigDAO.getTestHistoryFilteredByName.restore();
		});
	});

	describe('filterMine', () => {
		it('should return false if query filter does not equal "mine"', () => {
			//setup
			//action
			const actual = listTestsController.filterMine('hai');
			//assert
			assert.equal(actual, false);
		});
		it('should return true if passport data contains GitHUb id, and filter is "mine"', () => {
			//setup
			//action
			const actual = listTestsController.filterMine('mine', {user:{id:'1234'}});
			//assert
			assert.equal(actual, true);
		});
		it('should return false if passport data is null, even if filter is "mine"', () => {
			//setup
			//action
			const actual = listTestsController.filterMine('mine', null);
			//assert
			assert.equal(actual, false);
		});
	});
});

