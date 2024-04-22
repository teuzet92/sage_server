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

	async generateTurn(turn) {
		let storyteller = await this.get('storyteller');
		
		let records = this.get('records');
		let characterStorage = await this.get('characters');
		let characters = await characterStorage.getAll();
		for (let character of characters) {
			if (character.values.chatId) {
				let conversation = await character.exportConversation();
				await records.createModel({
					values: {
						turn: this.values.turn,
						type: 'conversation',
						content: conversation,
					}
				}).save();
			}
		}
		let newRecord = await storyteller.run(turn);
		await records.createModel({
			values: {
				turn,
				type: 'chronicle',
				content: newRecord,
			},
		}).save();
		this.values.turn = turn;
		await this.save();
	}

	async exportRecordsAsMessages() {
		let world = this.parent.parent;
		let content = this.project.content;
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
				content: record.values.content,
			});
		}
		return messages;
	}
}

