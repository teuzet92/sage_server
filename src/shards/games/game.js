const OpenAI = require('openai');
const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

module.exports = class extends getClass('storage/model/model') {
	cmd_addEvent({ text }) {
		return this.addEvent(text)
	}
	async addEvent(text) {
		await this.addMessage('system', text)
		return `Year ${this.values.year}, ${this.getCurrentSeasonName()}\n${text}`;
	}

	async addMessage(role, text) {
		let messagesStorage = await this.project.get('shards.gameMessages');
		return messagesStorage.createModel({
			values: {
				gameId: this.id,
				role,
				content: text,
			}
		});
	}

	async buildChat() {
		let contentStorage = await this.project.get('content.constructed');
		let contentResponse = await contentStorage.findOne({ id: 'latest' });
		let content = contentResponse.values.content;
		let scenarioId = this.values.scenarioId;
		let scenario = assert(content.scenarios[scenarioId]);
		let storedMessages = await this.getMessages();
		let chat = [{
			role: 'system',
			content: scenario.rules,
		}];
		let cityDescriptionMessage = require('util').format(scenario.cityDescription, this.values.cityName);
		chat.push({
			role: 'system',
			content: cityDescriptionMessage,
		});
		storedMessages.sort((a, b) => a.createTime - b.createTime);
		for (let message of storedMessages) {
			chat.push({
				role: message.values.role,
				content: message.values.content,
			});
		}
		if (scenario.agentNote) {
			chat.push({
				role: 'system',
				content: scenario.agentNote,
			})
		}
		return chat;
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
		let messages = await this.buildChat();
		messages.push({
			role: 'system',
			content: this.getNextRecordMessage(),
		});
		const response = await openai.chat.completions.create({
			model: "gpt-3.5-turbo",
			messages,
		});
		let answer = response.choices[0].message;
		await this.addMessage('assistant', answer.content);
		this.moveDate();
		await this.save();
		return answer.content;
	}

	cmd_getChat() {
		return this.buildChat();
	}

	async getMessages() {
		let gameMessagesStorage = await this.project.get('shards.gameMessages');
		return gameMessagesStorage.find({ 'values.gameId': this.id });
	}

}

