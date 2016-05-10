/*global describe it beforeEach*/
import {GitHelper} from '../../helpers/gitHelper';
import sinon from 'sinon';
import {assert} from 'chai';

import fs from 'fs';

describe('GitHelper', () => {
	const configuration = {
		repo: 'github-user/repoName',
		github: {branch: 'foobar'}
	};

	let gitHelper;

	beforeEach(() => {
		gitHelper = new GitHelper(configuration);
	});

	describe('buildRepositoryCloneLocation', () => {
		it('should combine a prefix with the second half of the repo name given in the conrfiguration', () => {
			//setup
			//action
			const actual = gitHelper.buildRepositoryCloneLocation('user/repoName');
			//assert
			assert.equal(actual, '/tmp/ludwig-git-repoName.git');
		});
	});

	describe('init', () => {
		it('should clone the target repo in /tmp if it is not present there and return a resolved promise', (done) => {
			//setup
			sinon.stub(fs, 'stat').yields(null, {
				isDirectory: () => {
					return false;
				}
			});
			const cloneSpy = sinon.stub().yields(null);
			const context = {simpleGit: {clone: cloneSpy}, configuration, repositoryCloneLocation:'/tmp/ludwig-git-repoName.git'};

			//action
			gitHelper.init.call(context).then(() => {
				//assert
				assert.equal(cloneSpy.calledOnce, true);
				assert.deepEqual(cloneSpy.getCall(0).args[0], 'https://github.com/github-user/repoName.git');
				assert.deepEqual(cloneSpy.getCall(0).args[1], '/tmp/ludwig-git-repoName.git');

				done();
			}).catch((error) => {
				done(error);
			});
			fs.stat.restore();
		});

		it('should checkout the target repo branch in /tmp if repo is already cloned and return a resolved promise', (done) => {
			//setup
			sinon.stub(fs, 'stat').yields(null, {
				isDirectory: () => {
					return true;
				}
			});
			const pullSpy = sinon.stub().yields(null);
			const cloneSpy = sinon.stub().yields(null);
			const context = {
				simpleGit: {
					clone: cloneSpy, checkout: () => {
					}, pull: pullSpy
				}, configuration
			};
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
			}).catch((error) => {
				done(error);
			});

			fs.stat.restore();
		});

		it('should raise an error if stat call fails', (done) => {
			//setup
			sinon.stub(fs, 'stat').yields(new Error('FS error'));
			const cloneSpy = sinon.stub().yields(null);
			const context = {simpleGit: {clone: cloneSpy}, configuration};
			//action
			gitHelper.init.call(context).then(() => {
				done(new Error('Call should throw an error here'));
			}).catch((exception) => {
				assert.equal(exception.message, 'FS error');
				done();
			});
			fs.stat.restore();
		});
	});

	describe('getEarliestCommitAuthorForFile', () => {
		it('should reject if there is an error getting the log', (done) => {
			//setup
			const context = {
				simpleGit: {
					log: sinon.stub().yields(new Error('Log error'))}};
			//action
			gitHelper.getEarliestCommitAuthorForFile.call(context, '/file.name')
				.then(() => {
					done(new Error('We should reject if log retireval triggered an error'));
				})
				.catch((error) => {
					//assert
					assert.equal(error.message, 'Error while getting log for file /file.name');
					done();
				});
		});

		it('should return the author data from the first commit for a file', (done) => {
			//setup
			const context = {
				simpleGit: {
					log: sinon.stub().yields(null, {
						latest: {}, total: 2,
						all: [
							{
								hash: 'f2ebb9207ec2154cf4a442dbb63fe03eee3f0588',
								date: '2016-04-27 09:58:39 +0200',
								author_name: 'Foo Bar',
								author_email: 'foobar@users.noreply.github.com'
							},
							{
								hash: '8dc28b3b4ee439a9581597d4ce93dbc2ffeb2378',
								date: '2016-04-26 09:58:39 +0200',
								author_name: 'Baz Lightning',
								author_email: 'baz@users.noreply.github.com'
							} ]
					})}};
			//action
			gitHelper.getEarliestCommitAuthorForFile.call(context, '/file.name')
				.then((data) => {
					//assert
					assert.deepEqual(data, {
						commit: {author: {name: 'Baz Lightning', email: 'baz@users.noreply.github.com'}}
					});
					done();
				})
				.catch((error) => {
					done(error);
				});
		});
	});
});
