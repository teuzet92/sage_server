const OpenAI = require('openai');
const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

module.exports = class extends getClass('storage/model/model') {

	cmd_addEvent({ text }) {
		return this.addEvent(text)
	}
	async addEvent(text) {
		let content = `Year ${this.values.year}, ${this.getCurrentSeasonName()}\n${text}`;
		let chronicleChat = await this.parent.parent.get(`chats.${this.values.chronicleChatId}`);
		await chronicleChat.addMessage('user', content)
		return content
	}

	cmd_callChancellor() {
		return this.newChancellorChat();
	}

	async newChancellorChat() {

		let chronicleChatMessageStorage = await this.parent.parent.get(`chats.${this.values.chronicleChatId}.messages`);
		let chronicleMessages = await chronicleChatMessageStorage.getAll({ 'values.role': { $ne: 'system' } });
		let chronicleText = chronicleMessages.map(model => model.values.content).join('\n\n');
		chronicleText = `Here is a chronicle of the city: \n\n${chronicleText}`;

		let scenario = await this.project.get(`content.templates.scenarios.objects.${this.values.scenarioId}`);
		let agentId = assert(scenario.values.chancellorAgentId)
	
		let chatStorage = await this.parent.parent.get('chats');
		let chancellorChat = chatStorage.createModel({ values: { agentId } });
		await chancellorChat.start();
		await chancellorChat.addMessage('system', chronicleText);
		await chancellorChat.addMessage('assistant', 'How may I help you, Your Majesty?');
	}

	async start() {
		let scenario = await this.project.get(`content.templates.scenarios.objects.${this.values.scenarioId}`);
		this.values.year = scenario.values.startingYear;
		this.values.season = 0;

		let chronistAgentId = assert(scenario.values.chronistAgent);
		let chatStorage = await this.parent.parent.get('chats');
		let chronicleChat = chatStorage.createModel({ values: { agentId: chronistAgentId } });
		await chronicleChat.start();
		
		let cityDescription = require('util').format(scenario.values.cityDescription, this.values.cityName);
		await chronicleChat.addMessage('user', cityDescription);

		this.values.started = this.time();
		this.values.chronicleChatId = chronicleChat.id;
		await this.save();
		return cityDescription;
	}

	async moveDate() {
		this.values.season = this.values.season + 1
		if (this.values.season > 3) {
			this.values.season = 0;
			this.values.year = this.values.year + 1;
		}
	}

	getCurrentSeasonName() {
		let seasonNames = [
			'Spring',
			'Summer',
			'Autumn',
			'Winter',
		];
		return seasonNames[this.values.season];
	}

	getNextRecordMessage() {
		let year = this.values.year;
		let seasonName = this.getCurrentSeasonName();
		return require('util').format('Produce a record for: Year %s, %s', this.values.year, seasonName);
	}

	cmd_next() {
		return this.next();
	}

	async next() {
		let chronicleChat = await this.parent.parent.get(`chats.${this.values.chronicleChatId}`);
		await chronicleChat.addMessage('system', this.getNextRecordMessage()); // TODO: Не факт, что такие штуки нужно сохранять
		let answerText = await chronicleChat.continue();
		this.moveDate();
		await this.save();
		return answerText;
	}

}

