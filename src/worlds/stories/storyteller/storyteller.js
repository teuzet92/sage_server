module.exports = class extends getClass('dweller') {

	async run(turn) {
		let story = this.parent;
		let world = story.parent.parent;
		let content = engine.content;
		let messages = [];
		let scenarioTpl = content.scenarios[world.values.scenarioId];
		let storytellerTpl = content.storytellers[scenarioTpl.storytellerId];
		messages.push({
			role: 'system',
			content: storytellerTpl.intro,
		});
		let records = await story.exportRecordsAsMessages();
		messages = messages.concat(records);
		messages.push({
			role: 'user',
			content: `Produce a record for: ${world.getTurnName(turn)}`,
		});
		let llmProvider = await engine.get('llmProviders.chatGpt');
		return await llmProvider.answer(messages); // TODO: Добавить температуру
	}

}
