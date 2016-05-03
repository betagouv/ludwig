/*global describe it beforeEach afterEach*/
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

		let cloneSpy = sinon.spy();

		let gitHelper;

		beforeEach( () => {
			gitHelper = new GitHelper(configuration);
		});

		afterEach( () => {
			cloneSpy.reset();
		});

		it('should clone the target repo in /tmp if it is not present there', () => {
			//setup
			sinon.stub(fs, 'stat').yields(null, {isDirectory:() => {return false;}});
			const context = {simpleGit:{clone:cloneSpy}, configuration};

			//action
			gitHelper.init.call(context);
			//assert
			assert.equal(cloneSpy.calledOnce, true);
			assert.deepEqual(cloneSpy.getCall(0).args[0], 'https://github.com/github-user/repoName.git');
			assert.deepEqual(cloneSpy.getCall(0).args[1], '/tmp/ludwig-git-repoName.git');
			fs.stat.restore();
		});

		it('should checkout the target repo branch in /tmp if repo is already cloned', () => {
			//setup
			sinon.stub(fs, 'stat').yields(null, {isDirectory:() => {return true;}});
			const checkoutSpy = sinon.spy();
			const context = {simpleGit:{clone:cloneSpy, checkout:checkoutSpy}, configuration};

			//action
			gitHelper.init.call(context);
			//assert
			assert.equal(cloneSpy.called, false);
			assert.equal(checkoutSpy.calledOnce, true);
			assert.equal(checkoutSpy.getCall(0).args[0], 'foobar');
			fs.stat.restore();
		});

		it('should raise an error if stat call fails', (done) => {
			//setup
			sinon.stub(fs, 'stat').yields(new Error('FS error'));
			const context = {simpleGit:{clone:cloneSpy}, configuration};
			//action
			try {
				gitHelper.init.call(context);
				done(new Error('Call should throw an error here'));
			} catch (exception) {
				assert.equal(exception.message, 'FS error');
				done();
			}
			fs.stat.restore();
		});
	});
});
