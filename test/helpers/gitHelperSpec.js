/*global describe it beforeEach*/
import {GitHelper} from '../../helpers/gitHelper';
import sinon from 'sinon';
import {assert} from 'chai';

import fs from 'fs';

describe('GitHelper', () => {
	describe('init', () => {
		const configuration = {
			repo: 'github-user/repoName',
			github:{branch:'foobar'}
		};

		let gitHelper;

		beforeEach( () => {
			gitHelper = new GitHelper(configuration);
		});

		it('should clone the target repo in /tmp if it is not present there and return a resolved promise', (done) => {
			//setup
			sinon.stub(fs, 'stat').yields(null, {isDirectory:() => {return false;}});
			const cloneSpy = sinon.stub().yields(null);
			const context = {simpleGit:{clone:cloneSpy}, configuration};

			//action
			gitHelper.init.call(context).then( () => {
				//assert
				assert.equal(cloneSpy.calledOnce, true);
				assert.deepEqual(cloneSpy.getCall(0).args[0], 'https://github.com/github-user/repoName.git');
				assert.deepEqual(cloneSpy.getCall(0).args[1], '/tmp/ludwig-git-repoName.git');

				done();
			}).catch( (error) => {
				done(error);
			});
			fs.stat.restore();
		});

		it('should checkout the target repo branch in /tmp if repo is already cloned and return a resolved promise', (done) => {
			//setup
			sinon.stub(fs, 'stat').yields(null, {isDirectory:() => {return true;}});
			const pullSpy = sinon.stub().yields(null);
			const cloneSpy = sinon.stub().yields(null);
			const context = {simpleGit:{clone:cloneSpy, checkout: () => {}, pull:pullSpy}, configuration};
			const checkoutSpy = sinon.stub(context.simpleGit, 'checkout').yields(null, null);
			//action
			gitHelper.init.call(context).then(() => {
				//assert
				assert.equal(cloneSpy.called, false);
				assert.equal(checkoutSpy.calledOnce, true);
				assert.equal(checkoutSpy.getCall(0).args[0], 'foobar');
				assert.equal(pullSpy.calledOnce, true);
				assert.equal(pullSpy.getCall(0).args[0], 'origin');
				assert.equal(pullSpy.getCall(0).args[1], 'foobar');
				done();
			}).catch( (error) => {
				done(error);
			});

			fs.stat.restore();
		});

		it('should raise an error if stat call fails', (done) => {
			//setup
			sinon.stub(fs, 'stat').yields(new Error('FS error'));
			const cloneSpy = sinon.stub().yields(null);
			const context = {simpleGit:{clone:cloneSpy}, configuration};
			//action
			gitHelper.init.call(context).then( () => {
				done(new Error('Call should throw an error here'));
			} ).catch( (exception) => {
				assert.equal(exception.message, 'FS error');
				done();
			});
			fs.stat.restore();
		});
	});
});
