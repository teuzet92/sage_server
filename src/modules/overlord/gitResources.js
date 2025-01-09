const fs = require('fs/promises');
const path = require('path');
const simpleGit = require('simple-git');
const USER = process.env.GIT_USER;
const TOKEN = process.env.GIT_ACCESS_TOKEN;
const REPO = process.env.GIT_OVERLORD_REPO;
const remote = `https://${USER}:${TOKEN}@${REPO}`;

const { MD5 } = require('crypto-js');

module.exports = class extends getClass('dweller') {

	async initGitRepo(repoDir) {
		await fs.rm(repoDir, { recursive: true, force: true });
		await simpleGit().clone(remote, repoDir);
	}

	async provideResources() {
		let repoDir = this.config.repoDir;
		await this.initGitRepo(repoDir);
		// Хак. Реинициализируем гит в новой папке, а то он путается, будучи внутри репы
		let git = simpleGit(repoDir);

		let resourcesRoot = path.join(repoDir, this.config.resourcesRoot);
		const publicResDir = this.config.publicResDir;
		const result = {};

		async function recursiveProcess(currentPath, relativePath = '') {
			const entries = await fs.readdir(currentPath, { withFileTypes: true });

			for (const entry of entries) {
				const entryPath = path.join(currentPath, entry.name);
				const entryRelativePath = path.join(relativePath, entry.name);

				if (entry.isDirectory()) {
					await recursiveProcess(entryPath, entryRelativePath);
				} else if (entry.isFile()) {
					let isResource;
					let resourceTypes = engine.config.resourceTypes;
					const outputDir = path.join(publicResDir, relativePath);
					const resourceId = path.join(relativePath, entry.name).replace(/\\/g, '/');
					const resourceHash = MD5(resourceId).toString();
					const resourceUrl = path.join(publicResDir, resourceHash);
					for (let [ resourceType, resourceTypeData ] of Object.entries(resourceTypes)) {
						let ext = resourceTypeData.extension
						if (path.extname(entry.name) === ext) {
							result[resourceId] = {
								type: resourceType,
								url: `${MD5(resourceId).toString()}${ext}`,
							};
							await fs.mkdir(outputDir, { recursive: true });
							await fs.rename(entryPath, `${resourceUrl}${ext}`);
						}
					}
				}
			}
		}

		await recursiveProcess(resourcesRoot);
		await fs.rm(repoDir, { recursive: true });
		return result
	}
}

