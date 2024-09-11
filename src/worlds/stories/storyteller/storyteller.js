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
		let newEntryPrompt = storytellerTpl.prompt;
		newEntryPrompt = newEntryPrompt.replace('%turnName', world.getTurnName(turn))
		messages.push({
			role: 'user',
			content: newEntryPrompt,
		});
		env.log(messages);
		let llmProvider = await engine.get('llmProviders.chatGpt');
		let functions = [
			{
				name: 'add_chronicle_event',
				description: 'Adds new set of events to the city chronicle',
				parameters: {
					type: 'object',
					properties: {
						events: {
							type: 'array',
							description: 'The array of events in the chronicle record',
							items: {
								type: 'object',
								properties: {
									date: {
										type: 'string',
										description: 'The date of the event',
									},
									content: {
										type: 'string',
										description: 'What happened during the event'
									},
								}
							}
						},
					},
					required: [ 'events' ],
				},
			}
		];
		return await llmProvider.answer(messages, functions); // TODO: Добавить температуру
	}

}
