const TelegramBot = require('node-telegram-bot-api');

module.exports = class TelegramServer {
	constructor(project, config) {
		this.project = project;
		const token = assert(process.env[config.apiTokenKeyInEnv]);
		this.handlerId = assert(config.handlerId);
		this.bot = new TelegramBot(token, { polling: true });
		this.bot.on('message', (message) => this.onMessage(message));
		// TODO: Садресовать хэндлер и вытащить список команд
	}

	async onMessage(message) {
		let userId = message.chat.id;
		let username = message.chat.username;
		try {
			let handler = await this.project.get(this.handlerId);
			let response = await handler.onMessage({ userId, username}, message);
			this.bot.sendMessage(userId, response);
		} catch (error) {
			env.error('Telegram error\n');
			env.error(error);
			this.bot.sendMessage(userId, `Server error: ${error.message}`);
		}
	}
}

// bot.setMyCommands([
// 	// { command: "start", description: "Welcome"},
// 	{ command: "new", description: "Starts new game" },
// 	{ command: "next", description: "Generates next chronicle record" },
// 	{ command: "event", description: "Add and event to the chronicle" },
// ]);