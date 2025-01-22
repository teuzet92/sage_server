const fs = require('fs');
const simpleGit = require('simple-git');
const util = require('node:util');

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

	async complileRhaiContent() {
		let contentConstruct = engine.get('content.construct');
		let contentRhai = await contentConstruct.run('rhai');
		let stringContent = JSON.stringify(contentRhai.content, null, 2);
		stringContent = stringContent.replace(/'/g, '"');
		stringContent = stringContent.replace(/\{/g, '#{');
		let rhaiLibScript = `const CONTENT_RAW = ${stringContent};\n\n`;

		let templateHelpers = Object.entries(contentRhai.content)
			.map(([ templateId, templateData ]) => {
				let helperScript = `fn ${templateId}(id) {\n`
				helperScript += `    return global::CONTENT_RAW.${templateId}[\`\${id}\`];\n`;
				helperScript += '}\n';
				return helperScript;
			})
			.join('\n');
		rhaiLibScript += templateHelpers;

		let rhaiLibsStorage = engine.get('content.templates.script_modules.objects');
		let contentLib;
		let contentLibs = await rhaiLibsStorage.getAll({ 'values.name': 'content' });
		if (contentLibs.length == 0) {
			contentLib = rhaiLibsStorage.createModel({
				values: {
					name: 'content',
					script: rhaiLibScript,
				}
			})
		} else {
			contentLib = contentLibs[0];
			contentLib.values.script = rhaiLibScript;
		}
		await contentLib.save();
	}

	async run(apiActionUser, adminMessage) {
		let contentDir = this.config.contentDir;
		await this.initGitRepo();
		// Хак. Реинициализируем гит в новой папке, а то он путается, будучи внутри репы
		let git = simpleGit(contentDir);

		// Собираем весь контент с нуля
		fs.rmSync(`${contentDir}/loc`, { recursive: true, force: true });
		fs.rmSync(`${contentDir}/content.json`);

		await this.complileRhaiContent();
		return;

		let contentConstruct = engine.get('content.construct');
		let contentRaw = await contentConstruct.run('overlord_rust');
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
		let commitAuthor = `${apiActionUser.id} <${apiActionUser.values.email}>`;
		await git.commit(commitMessage, modified, { '--author': commitAuthor });
		await git.push();
		return 'Successfully pushed to content repo!';
		fs.rmSync(`${contentDir}`, { recursive: true, force: true });
	}

	cmd_run({ apiActionUser, adminMessage }) {
		return this.run(apiActionUser, adminMessage);
	}
}
