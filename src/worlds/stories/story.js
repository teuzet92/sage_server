

module.exports = class extends getClass('storage/model/model') {



	async start() {
		assert(this.values.cityName, 'First assign a name to the city');
		assert(this.values.scenarioId, 'First assign scenario to the game');
		let scenario = await this.project.get(`content.templates.scenarios.objects.${this.values.scenarioId}`);
		this.values.turn = 0;

		let cityDescriptor = await this.get('cityDescriptor');
		let cityDescription = await cityDescriptor.task(`Please generate a description for a city named ${this.values.cityName}`);

		this.values.cityDescription = cityDescription;
		this.values.started = this.time();
		await this.save();
		return cityDescription;
	}



	getNextRecordMessage() {
		return `Produce a record for: ${this.getTurnName(this.values.turn + 1)}`;
	}

	cmd_setCityName({ name }) {
		return this.setCityName(name);
	}

	cmd_next() {
		return this.next();
	}

	async addNewChronicle(content, type = 'record') {
		let chronicleStorage = await this.get('chronicle');
		let chronicleModel = chronicleStorage.createModel({
			values: {
				turn: this.values.turn,
				type,
				content,
			}
		})
		await chronicleModel.save();
	}

	async next() {
		let task = this.getNextRecordMessage();
		let chronistAgent = await this.get('chronist');
		let answer = await chronistAgent.task(task);
		await this.addNewChronicle(answer);
		this.values.turn += 1;
		this.values.chancellorChatId = null;
		this.save();
		return answer;
	}

	cmd_sayToChancellor({ text }) {
		return this.sayToChancellor(text);
	}

	async sayToChancellor(text) {
		if (!this.values.chancellorChatId) {
			let chatStorage = await this.parent.parent.get('chats');
			let chancellorChat = chatStorage.createModel({
				values: {
					reason: `Game ${this.id}. Turn ${this.values.turn}. Chancellor`,
				}
			});
			await chancellorChat.save();
			this.values.chancellorChatId = chancellorChat.id;
			await this.save();
		}
		let chancellorAgent = await this.get('chancellor');
		let chancellorResponse = await chancellorAgent.task(text);
		if (chancellorResponse.search('END') > 0) {
			let summary = await this.getChancellorConversationSummary();
			if (summary) {
				await this.addNewChronicle(summary, 'decision');
			}
			this.values.chancellorChatId = null;
			await this.save();
			// chancellorResponse = chancellorResponse.replace('END','');
		}
		return chancellorResponse;
	}

	async getChancellorConversationSummary() {
		let chancellorRecapperAgent = await this.get('chancellorRecapper');
		let chancellorRecapperResponse = await chancellorRecapperAgent.task();
		return chancellorRecapperResponse;
	}

	async getChronicle() {
		let chronicleStorage = await this.get('chronicle');
		return chronicleStorage.getAll();
	}

}

