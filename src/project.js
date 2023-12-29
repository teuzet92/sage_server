module.exports = class Project extends getClass('dweller') {
	init(data) {
		this.cachedDwellers = {};
		let telegramServers = this.config.telegramServers;
		if (!telegramServers) return;
		this.telegramServers = {};
		const TelegramServer = require('./telegram/telegramServer');
		for (let telegramServerConfig of Object.values(telegramServers)) {
			this.telegramServers[telegramServerConfig.id] = new TelegramServer(this, telegramServerConfig);
		}
		this.loaded = true;
		this.loadContent();
	}

	async loadContent() {
		let latestContent = await this.get('content.constructed.latest').load();
		this.content = latestContent.values.content;
	}

}



