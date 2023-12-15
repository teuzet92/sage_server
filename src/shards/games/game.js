

module.exports = class extends getClass('storage/model/model') {



	async start() {
		let scenario = await this.project.get(`content.templates.scenarios.objects.${this.values.scenarioId}`);
		this.values.turn = 0;

		let cityDescription = require('util').format(scenario.values.cityDescription, this.values.cityName);

		this.values.cityDescription = cityDescription;
		this.values.started = this.time();
		await this.save();
		return cityDescription;
	}

	getTurnName(turn) {
		let year = Math.floor(turn / 4) + 1415; // TODO: константа из собранного контента
		const seasonNames = [
			'Spring',
			'Summer',
			'Autumn',
			'Winter',
		];
		let seasonIndex = turn % 4;
		let seasonName = seasonNames[seasonIndex];
		return `Year ${year}, ${seasonName}`;
	}

	getNextRecordMessage() {
		return `Produce a record for: ${this.getTurnName(this.values.turn + 1)}`;
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

