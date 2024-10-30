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

	async run(apiActionUser) {
		let contentDir = this.config.contentDir;
		await this.initGitRepo();
		// Хак. Реинициализируем гит в новой папке, а то он путается, будучи внутри репы
		let git = simpleGit(contentDir);

		// Собираем весь контент с нуля
		fs.rmSync(`${contentDir}/loc`, { recursive: true, force: true });
		fs.rmSync(`${contentDir}/content.json`);

		let contentConstruct = engine.get('content.construct');
		let contentRaw = await contentConstruct.run('3zt4Lxm0RT'); // TODO
		await fs.promises.mkdir(`${contentDir}/loc`, { recursive: true });
		let content = contentRaw.content;
		this.writeObjectToContent(contentRaw.content, 'content.json');
		for (let [ lang, translation ] of Object.entries(contentRaw.loc)) {
			this.writeObjectToContent(translation, `loc/${lang}.json`);
		}
		let status = await git.status();
		if (status.modified.length == 0) return; // Нет изменений в контенте
		await git.add('./');
		await git.commit(`Automated commit from Overlord CMS. Admin user: ${apiActionUser.id}`);
		await git.push();
		return 'Successfully pushed to content repo!';
	}

	cmd_run({ apiActionUser }) {
		return this.run(apiActionUser);
	}
}
