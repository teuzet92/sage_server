const TelegramBot = require('node-telegram-bot-api');

module.exports = class TelegramServer {
	constructor(project, config) {
		this.project = project;
		const token = assert(process.env[config.apiTokenKeyInEnv]);
		this.handlerId = assert(config.handlerId);
		this.bot = new TelegramBot(token, { polling: true });
		this.bot.on('message', (message) => this.onMessage(message));
		this.bot.setMyCommands([
			{ command: "start", description: "Welcome"},
			{ command: "new_game", description: 'Starts new game' },
			{ command: "next", description: "Generates next chronicle record" },
			{ command: "new_scenario", description: "Starts new game with scenario ID" },
			{ command: "end_game", description: "Ends current game if there is one" },
			{ command: "help", description: 'Displays help' },
		]);
	}

	async logRequest(values) {
		let apiLogStorage = await this.project.get('apiLogs');
		apiLogStorage.createModel({ values }).save();
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
			this.logRequest({
				source: 'telegram',
				level: 'error',
				session: userId,
				params: { message },
				response: `Server error: ${error.message}`,
			});
			this.bot.sendMessage(userId, `Server error: ${error.message}`);
		}
	}
}

