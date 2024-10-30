const fs = require('fs');
const simpleGit = require('simple-git');

const USER = 'teuzet92';
const TOKEN = process.env.GIT_ACCESS_TOKEN;
const REPO = 'github.com/teuzet92/overlord_game_content';

const remote = `https://${USER}:${TOKEN}@${REPO}`;


const git = simpleGit();

const cloneContentRepo = async function() {
	const sourceDir = '../content';
	await git.clone(remote, sourceDir);
}



const writeObjectToContent = function(object, filename) {
	let json = JSON.stringify(object, null, 2);
	fs.writeFileSync(`../content/${filename}`, json);
}

module.exports = class extends getClass('dweller') {

	async run() {
		fs.rmSync('../content', { recursive: true, force: true });
		await cloneContentRepo();



		// Обновление контента
		// fs.rmSync('../content/loc', { recursive: true, force: true });
		// fs.rmSync('../content/content.json');

		// let contentConstruct = engine.get('content.construct');
		// let contentRaw = await contentConstruct.run('3zt4Lxm0RT');
		// await fs.promises.mkdir('../content/loc', { recursive: true });
		// let content = contentRaw.content;
		// writeObjectToContent(contentRaw.content, 'content.json');
		// for (let [ lang, translation ] of Object.entries(contentRaw.loc)) {
		// 	writeObjectToContent(translation, `loc/${lang}.json`);
		// }


		fs.writeFileSync(`../content/content.json`, 'HAHAHA');

		let newGit = simpleGit('../content');
		env.log(newGit.status());
		env.log(git.status());
		git.add('./');
		env.log(git.status());
		git.commit('Test automated commit');
		env.log(git.status());
		git.push();
		env.log('SUCCESS!')
	}

	cmd_run() {
		this.run();
	}
}
