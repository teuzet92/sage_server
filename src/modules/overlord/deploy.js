const fs = require('fs');
const simpleGit = require('simple-git');

const USER = process.env.GIT_USER;
const TOKEN = process.env.GIT_ACCESS_TOKEN;
const REPO = process.env.GIT_CONTENT_REPO;

const remote = `https://${USER}:${TOKEN}@${REPO}`;

module.exports = class extends getClass('dweller') {

	async initGitRepo() {
		fs.rmSync(this.config.contentDir, { recursive: true, force: true });
		await simpleGit().clone(remote, this.config.contentDir);
	}

	writeObjectToContent(object, filename) {
		let json = JSON.stringify(object, null, 2);
		fs.writeFileSync(`${this.config.contentDir}/${filename}`, json);
	}

	async run(apiActionUser, adminMessage) {
		let contentDir = this.config.contentDir;
		await this.initGitRepo();
		// Хак. Реинициализируем гит в новой папке, а то он путается, будучи внутри репы
		let git = simpleGit(contentDir);

		// Собираем весь контент с нуля
		fs.rmSync(`${contentDir}/loc`, { recursive: true, force: true });
		fs.rmSync(`${contentDir}/content.json`);

		let contentConstruct = engine.get('content.construct');
		let contentRaw = await contentConstruct.run('3zt4Lxm0RT'); // TODO
		let content = contentRaw.content;
		this.writeObjectToContent(contentRaw.content, 'content.json');
		if (contentRaw.loc) {
			await fs.promises.mkdir(`${contentDir}/loc`, { recursive: true });
			for (let [ lang, translation ] of Object.entries(contentRaw.loc)) {
				this.writeObjectToContent(translation, `loc/${lang}.json`);
			}
		}
		if (contentRaw.rhaiScripts) {
			await fs.promises.mkdir(`${contentDir}/scripts`, { recursive: true });
			for (let [ scriptId, script ] of Object.entries(contentRaw.rhaiScripts)) {
				fs.writeFileSync(`${contentDir}/scripts/${scriptId}`, script);
			}
		}
		let status = await git.status();
		let added = status.not_added;
		let modified = status.modified;
		if (modified.length == 0 && added.length == 0) return; // Нет изменений в контенте
		await git.add('./*');
		let commitMessage = `Content update from Overlord Admin.`;
		if (adminMessage) {
			commitMessage = [ commitMessage, adminMessage ];
		};
		let commitAuthor =  `${apiActionUser.id} <${apiActionUser.values.email}>`;
		await git.commit(commitMessage, modified, { '--author': commitAuthor });
		await git.push();
		return 'Successfully pushed to content repo!';
		// fs.rmSync(`${contentDir}`, { recursive: true, force: true });
	}

	cmd_run({ apiActionUser, adminMessage }) {
		return this.run(apiActionUser, adminMessage);
	}
}
