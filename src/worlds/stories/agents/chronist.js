module.exports = class extends getClass('play/games/agents/agent') {

	async collectGameChronicleAsMessages() {
		let game = this.parent;
		let messages = [];
		messages.push({
			role: 'system',
			content: game.values.cityDescription,
		});
		let chronicleRecords = await game.getChronicle();
		let eventPool = [];
		for (let chronicleRecordModel of chronicleRecords) {
			let turnName = game.getTurnName(chronicleRecordModel.values.turn);
			if (chronicleRecordModel.values.type == 'decision') {
				messages.push({
					role: 'user',
					content: `${turnName}.\n${chronicleRecordModel.values.content}`,
				});
			} else {
				if (eventPool.length > 0) {
					messages.push({
						role: 'user',
						content: `${eventPool.join('\n\n')}\n\nProduce a record for: ${turnName}`,
					});
				} else {
					messages.push({
						role: 'user',
						content: ``,
					});
				}
				messages.push({
					role: 'assistant',
					content: chronicleRecordModel.values.content,
				});
			}
		}
		return messages;
	}

	async onTask(task) {
		let messages = await this.collectGameChronicleAsMessages();
		messages.push({
				role: 'user',
				content: task,
		});

		// PLAIN CHRONICLE
		// let messages = [
		// 	{
		// 		role: 'user',
		// 		content: await this.collectGameChronicle(),
		// 	},
		// 	{
		// 		role: 'user',
		// 		content: task,
		// 	},
		// ];
		
		return this.providerCall(messages);
	}
}
