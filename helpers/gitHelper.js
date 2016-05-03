import simpleGit from 'simple-git';
import fs from 'fs';


class GitHelper {
	constructor(ludwigConfiguration) {
		this.simpleGit = simpleGit;
		this.configuration = ludwigConfiguration;
	}

	init() {
		const repositoryCloneLocation = `/tmp/ludwig-git-${this.configuration.repo.split('/')[1]}.git`;
		fs.stat(repositoryCloneLocation, (err, stat) => {
			if (err) {
				throw err;
			}
			if (!stat.isDirectory()) {
				this.simpleGit.clone(`https://github.com/${this.configuration.repo}.git`, repositoryCloneLocation, () => {
					//déclencher le vrai travail intéressant
				});
			} else {
				this.simpleGit.checkout(this.configuration.github.branch, () => {
					//déclencher le vrai travail intéressant
				});
			}
		});
	}
}

export {GitHelper};
