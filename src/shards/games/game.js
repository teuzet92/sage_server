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
		console.log('ADD EVENT')
		return `Year: ${this.values.year}. ${this.getCurrentSeasonName()}\n${text}`;
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
		let modelId = this.values.modelId;
		let gameModel = assert(content.models[modelId]);
		let storedMessages = await this.getMessages();
		let chat = [{
			role: 'system',
			content: gameModel.rules,
		}];
		let cityDescriptionMessage = require('util').format(gameModel.cityDescription, this.values.cityName);
		chat.push({
			role: 'system',
			content: cityDescriptionMessage,
		});
		for (let message of storedMessages) {
			chat.push({
				role: message.values.role,
				content: message.values.content,
			});
		}
		if (gameModel.agentNote) {
			chat.push({
				role: 'system',
				content: gameModel.agentNote,
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
		console.log(messages)
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

