module.exports = class Project extends getClass('dweller') {
	constructor(config) {
		super(config);
		this.cachedDwellers = {};
	}

	async init(config) {
		this.reloadContent();
		let telegramServers = this.config.telegramServers;
		if (!telegramServers) return;
		this.telegramServers = {};
		const TelegramServer = require('./telegram/telegramServer');
		for (let telegramServerConfig of Object.values(telegramServers)) {
			this.telegramServers[telegramServerConfig.id] = new TelegramServer(this, telegramServerConfig);
		}
	}

	async reloadContent() {
		let constructedContentStorage = await this.get('content.constructed');
		let contentData = await constructedContentStorage.findOne();
		this.content = assert(contentData.values.content);
	}
}



