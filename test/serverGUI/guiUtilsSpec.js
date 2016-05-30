/*global describe it*/
import guiUtils from '../../guiUtils/guiUtils';
import {assert} from 'chai';

describe('Server GUI utils', () => {
	describe('filterByTestName', () => {
		it('should return null if testName is empty', () => {
			//setup
			//action
			const actual = guiUtils.filterByTestName(null, '');
			//assert
			assert.equal(actual, null);
		});

		it('should return "?testNameFilter=foobar" if testName is "foobar" and there are no other filters defined', () => {
			//setup
			//action
			const actual = guiUtils.filterByTestName(null, 'foobar');
			//assert
			assert.equal(actual, '?testNameFilter=foobar');
		});

		it('should append "&testNameFilter=foobar" if window.location.search is not empty', () => {
			//setup
			//action
			const actual = guiUtils.filterByTestName('?test=1', 'foobar');
			//assert
			assert.equal(actual, '?test=1&testNameFilter=foobar');
		});

		it('should replace testNameFilter value if it is already set', () => {
			//setup
			//action
			const actual = guiUtils.filterByTestName('?testNameFilter=foobar&filter=mine', 'baz');
			//assert
			assert.equal(actual, '?testNameFilter=baz&filter=mine');
		});
	});

	describe('filterByMine', () => {
		it('should add the "mine" filter if no other filter is active', () => {
			//setup
			//action
			const actual = guiUtils.filterByMine({pathname:'/listTestsConnected', search:''});
			//assert
			assert.equal(actual, '/listTestsConnected?filter=mine');
		});
		it('should append the "mine" filter at the end of an existing search', () => {
			//setup

			//action
			const actual = guiUtils.filterByMine({pathname:'/listTestsConnected', search:'?testNameFilter=foo'});
			//assert
			assert.equal(actual, '/listTestsConnected?testNameFilter=foo&filter=mine');
		});
		it('should not append the "mine" filter multiple times if it already exists', () => {
			//setup

			//action
			const actual = guiUtils.filterByMine({pathname:'/listTestsConnected', search:'?filter=mine'});
			//assert
			assert.equal(actual, '/listTestsConnected?filter=mine');
		});
	});
});

