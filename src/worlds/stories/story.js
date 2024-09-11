module.exports = class extends getClass('storage/model/model') {

	cmd_start() {
		return this.start();
	}

	async start() {
		let world = this.parent.parent;
		this.values.started = this.time();
		this.values.turn = world.values.turn;
		await this.save();
	}

	async finalizeCharacters() {
		let characterStorage = await this.get('characters');
		let characters = await characterStorage.getAll();
		for (let character of characters) {
			if (character.values.chatId) {
				await character.finalize();
			}
		}
	}

	async cmd_testTurn() {
		this.generateTurn(this.values.turn + 1);
	}

	async generateTurn(turn) {
		let storyteller = await this.get('storyteller');
		let recordStorage = this.get('records');
		await this.finalizeCharacters();
		let newRecord = await storyteller.run(turn);
		env.log(newRecord)
		env.log(newRecord.choices[0].message)
		env.log(JSON.stringify(newRecord.choices[0].message))
		// await recordStorage.createModel({
		// 	values: {
		// 		turn,
		// 		type: 'chronicle',
		// 		content: newRecord,
		// 	},
		// }).save();
		// this.values.turn = turn;
		// await this.save();
	}

	async addEvent(text) {
		let recordStorage = await this.get('records');
		await recordStorage.createModel({
			values: {
				turn: this.values.turn,
				type: 'event',
				content: text,
			},
		}).save();
	}

	// Возвращает все записи истории и конфлюкса по определенным кверикам
	async getRecords(query) { 
		let out = [];
		let recordsStorage = await this.get('records');
		let ownRecords = await recordsStorage.getAll(query);
		for (let record of ownRecords) {
			out.push({
				turn: record.values.turn,
				type: record.values.type,
				content: record.values.content,
			});
		}
		let confluxId = this.values.confluxId;
		if (!confluxId) return ownRecords;
		let world = this.parent.parent;
		let confluxRecordStorage = await world.get(`confluxes.${confluxId}.records`);
		let confluxRecords = await confluxRecordStorage.getAll(query);
		return ownRecords.concat(confluxRecords);
	}

	async exportRecordsAsMessages() {
		let world = this.parent.parent;
		let content = engine.content;
		let scenarioTpl = content.scenarios[world.values.scenarioId];
		let messages = [];
		messages.push({
			role: 'system',
			content: scenarioTpl.lore,
		});
		messages.push({
			role: 'system',
			content: this.values.seed,
		});
		let recordsStorage = await this.get('records');
		let activeRecords = await recordsStorage.getAll({ 'values.recapped': { '$exists': false } });
		for (let record of activeRecords) {
			messages.push({
				role: 'system',
				// content: record.values.content,
				content: `${this.values.name}. ${world.getTurnName(record.values.turn)}.\n${record.values.content}`,
			});
		}
		let confluxId = this.values.confluxId;
		if (confluxId) {
			let conflux = await world.get(`confluxes.${confluxId}`);
			let confluxRecordStorage = await conflux.get('records');
			let confluxRecords = await confluxRecordStorage.getAll();
			for (let record of confluxRecords) {
				messages.push({
					role: 'system',
					content: `${this.values.name}. ${world.getTurnName(record.values.turn)}.\n${record.values.content}`,
				});
			}
		}
		return messages;
	}

}

