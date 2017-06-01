/*global describe it*/
import ListTestsController from '../../controllers/listTestsController';
import {assert} from 'chai';
import sinon from 'sinon';
import ludwigDAO from '../../database/ludwigDAO';

describe('ListTestsController', () => {
	describe('showLatestTestSuite',  () => {
		it('should return a rejected promise if getting most recent test suite raised an error', () => {
			//setup
			sinon.stub(ludwigDAO, 'getTestHistoryFilteredByUserData').returns(Promise.reject({some:'error'}));
			//action
			ListTestsController.showLatestTestSuite(null, (err) => {
				//assert
				assert.deepEqual(err, {some:'error'} );
			});
			ludwigDAO.getTestHistoryFilteredByUserData.restore();

		});

		it('should resolve w/ an empty testSuite if getting most recent test suite returned nothing', () => {
			//setup
			sinon.stub(ludwigDAO, 'getTestHistoryFilteredByUserData').returns(Promise.resolve(null));

			//action
			ListTestsController.showLatestTestSuite(null, (err, data) => {
				//assert
				assert.deepEqual(data, {testSuite:null} );
			});
			ludwigDAO.getTestHistoryFilteredByUserData.restore();
		});

		it('should resolve w/ a valid testSuite if getting most recent test suite returned something', (done) => {
			//setup
			sinon.stub(ludwigDAO, 'getTestHistoryFilteredByUserData').returns(Promise.resolve({testCases:[], name:'foo bar baz', timestamp:0}));

			//action
			ListTestsController.showLatestTestSuite(null, (err, data) => {
				//assert
				assert.equal(err, null);
				assert.deepEqual(data.testSuite, {testCases:[], name:'foo bar baz', timestamp:0});
				assert.match(data.formattedTimestamp, /^01\/01\/1970 à [0-9]{2}:00:00$/);
				done();
			});
			ludwigDAO.getTestHistoryFilteredByUserData.restore();
		});
	});

	describe('authenticateToFilterMyTests', () => {
		it('should redirect to "/listTests?filter=mine" if passport session data is defined', () => {
			//setup
			const res = {redirect:sinon.spy(), req:{query:{}, session:{passport:{}}}};
			//action
			ListTestsController.authenticateToFilterMyTests(res);
			//assert
			assert.equal(res.redirect.calledOnce, true);
			assert.equal(res.redirect.getCall(0).args[0], '/listTests?filter=mine');
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

		it('should include the testNameFilter query param if it is set in incoming query', () => {
			//setup
			const next = sinon.spy();
			const res = {redirect:sinon.spy(), req:{session:{passport:{}}, query:{testNameFilter:'foo'}}};
			//action
			ListTestsController.authenticateToFilterMyTests(res, next);
			//assert
			assert.equal(res.redirect.calledOnce, true);
			assert.equal(res.redirect.getCall(0).args[0], '/listTests?filter=mine&testNameFilter=foo');
			assert.equal(next.called, false);
		});
	});

	describe('buildTestFilterForUser', () => {
		it('should be empty if there is no session data', () => {
			//setup
			//action
			const actual = ListTestsController.buildTestFilterForUser({});
			//assert
			assert.deepEqual(actual, {});
		});

		it('should contain the "foobar" login if session data has a "foobar" login', () => {
			//setup

			//action
			const actual = ListTestsController.buildTestFilterForUser({login:'foobar'});
			//assert
			assert.deepEqual(actual, {login:'foobar'});
		});

		it('should contain the "Bar Baz" name if session data has a "Bar Baz" name property set', () => {
			//setup

			//action
			const actual = ListTestsController.buildTestFilterForUser({name:'Bar Baz'});
			//assert
			assert.deepEqual(actual, {name:'Bar Baz'});
		});

		it('should contain the ["mail@mail.net"] emails property if session data has a "mail@mail.net" email property', () => {
			//setup
			//action
			const actual = ListTestsController.buildTestFilterForUser({email:'mail@mail.net'});
			//assert
			assert.deepEqual(actual, {emails:[ 'mail@mail.net' ]});
		});

		it('should set the emails property of the result to the emails property of the session data if it exists', () => {
			//setup
			//action
			const actual = ListTestsController.buildTestFilterForUser({emails:[ {value:'some@mail.com'}, {value:'other@address.net'} ]});
			//assert
			assert.deepEqual(actual, {emails:[ 'some@mail.com', 'other@address.net' ]});
		});

		it('should combine email and emails properties if they both exist in session data', () => {
			//setup
			//action
			const actual = ListTestsController.buildTestFilterForUser({email:'some@mail.com', emails:[ {value:'other@address.net'} ]});
			//assert
			assert.deepEqual(actual, {emails:[ 'some@mail.com', 'other@address.net' ]});
		});
	});
});

