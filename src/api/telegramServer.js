const TelegramBot = require('node-telegram-bot-api');
const token = process.env.TELEGRAM_API_TOKEN;

module.exports = class TelegramServer {
	constructor(data) {
		this.projectId = data.project;
		this.bot = new TelegramBot(token, { polling: true });
		this.bot.on('message', (message) => this.onMessage(message));
	}

	async onMessage(message) {
		let userId = message.chat.id;
		let username = message.chat.username;
		try {
			let project = assert(env.projects[this.projectId], `Project '${this.projectId}' not found`);
			let handler = await project.get('shards.telegram');
			let response = await handler.onMessage({ userId, username}, message);
			this.bot.sendMessage(userId, response);
		} catch (error) {
			env.error('Telegram error\n');
			env.error(error);
			this.bot.sendMessage(userId, `Error: ${error.message}`);
			return;
		}
		// let commandData = slashCommand(message.text);
		// let action = commandData.command;
		// let rawParams = {
		// 	telegramId: message.chat.id,
		// 	telegramUsername: message.chat.username,
		// }
		// let actionParams = this.config.apiActions[action].params;
		// if (actionParams) {
		// 	let firstParamKey = Object.keys(actionParams)[0];
		// 	var rawParams = {};
		// 	rawParams[firstParamKey] = commandData.body;
		// }
		// return this.runAction(action, rawParams);
	}

}
