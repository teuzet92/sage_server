module.exports = class extends getClass('worlds/stories/agents/agent') {

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
		messages.push({
			role: 'system',
			content: scenarioTpl.lore,
		});
		messages.push({
			role: 'system',
			content: story.values.seed,
		});
		let recordsStorage = await story.get('records');
		let activeRecords = await recordsStorage.getAll({ 'values.recapped': { '$exists': false } });
		for (let record of activeRecords) {
			messages.push({
				role: 'system',
				content: record.values.content,
			});
		}
		messages.push({
			role: 'user',
			content: `Produce a record for: ${this.getTurnName(turn)}`,
		});
		let llmProvider = await engine.get(this.config.llmProvider);
		return await llmProvider.answer(messages); // TODO: Добавить температуру
	}

}
