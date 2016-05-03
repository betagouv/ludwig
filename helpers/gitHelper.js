import simpleGit from 'simple-git';
import fs from 'fs';


class GitHelper {
	constructor(ludwigConfiguration) {
		this.simpleGit = simpleGit;
		this.configuration = ludwigConfiguration;
	}

	init() {
		const repositoryCloneLocation = `/tmp/ludwig-git-${this.configuration.repo.split('/')[1]}.git`;
		return new Promise( (resolve, reject) => {
			fs.stat(repositoryCloneLocation, (err, stat) => {
				if (err) {
					throw err;
				}
				if (!stat.isDirectory()) {
					this.simpleGit.clone(`https://github.com/${this.configuration.repo}.git`, repositoryCloneLocation, (err, data) => {
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
}

export {GitHelper};
