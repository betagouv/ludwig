import simpleGit from 'simple-git';
import fs from 'fs';


class GitHelper {
	constructor(ludwigConfiguration) {
		this.repositoryCloneLocation = this.buildRepositoryCloneLocation(ludwigConfiguration.repo);
		this.simpleGit = simpleGit(this.repositoryCloneLocation);
		this.configuration = ludwigConfiguration;
	}

	buildRepositoryCloneLocation(repo) {
		return `/tmp/ludwig-git-${repo.split('/')[1]}.git`;
	}

	init() {
		const self = this;
		return new Promise((resolve, reject) => {
			fs.stat(self.repositoryCloneLocation, (err, stat) => {
				if (err && err.code != 'ENOENT') {
					return reject(err);
				}

				if (!stat || !stat.isDirectory()) {
					this.simpleGit.clone(`https://github.com/${this.configuration.repo}.git`, self.repositoryCloneLocation, (err, data) => {
						if (err) {
							return reject(err);
						}
						return resolve(data);
					});
				} else {
					this.simpleGit.checkout(this.configuration.github.branch, () => {
						this.simpleGit.pull('origin', this.configuration.github.branch, (err, data) => {
							if (err) {
								return reject(err);
							}
							return resolve(data);
						});
					});
				}
			});
		});
	}

	getEarliestCommitAuthorForFile(fileName) {
		return new Promise((resolve, reject) => {
			this.simpleGit.log({file:this.repositoryCloneLocation+'/'+fileName}, (err, data) => {
				if (err) {
					return reject(new Error(`Error while getting log for file ${fileName}`));
				}
				const oldestAuthorDataForFile = data.all.sort((a, b) => {
					return new Date(a.date).getTime() < new Date(b.date).getTime();
				}).pop();

				const commitDataToReturn = {
					commit: {author: {name: oldestAuthorDataForFile.author_name, email: oldestAuthorDataForFile.author_email}}
				};

				resolve(commitDataToReturn);
			});
		});
	}
}

export {GitHelper};
