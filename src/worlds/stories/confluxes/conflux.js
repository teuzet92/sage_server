module.exports = class extends getClass('storage/model/model') {

	cmd_start() {
		return this.generateTurn();
	}

	async start() {
		assert(!this.values.startTurn, `Conflux ${this.id} is already started`);
		let world = this.parent.parent;
		let turn = world.values.turn;
		let content = engine.content;

		let storyStorage = await world.get('stories');
		let stories = await storyStorage.getAll({ 'values.confluxId': this.id });
		assert(stories.length == 2, `Conflux ${this.id} has ${stories.length} stories. Required 2.`);
		let confluxTypeTpl = content.confluxTypes[this.values.confluxTypeId];
		this.values.startTurn = turn;
		this.values.endTurn = turn + confluxTypeTpl.duration;
		let turnName = world.getTurnName(turn);
		let endTurnName = world.getTurnName(this.values.endTurn);

		let startText = `${turnName}.\n${confluxTypeTpl.startText.replace('%turnName', turnName).replace('%endTurn', endTurnName)}`;
		let firstStoryText = startText
			.replace('%storyName', stories[0].values.name)
			.replace('%otherStoryName', stories[1].values.name);
		await stories[0].addEvent(firstStoryText);

		let secondStoryText = startText
			.replace('%storyName', stories[1].values.name)
			.replace('%otherStoryName', stories[0].values.name);
		await stories[1].addEvent(secondStoryText);
		await this.save();

	}

	cmd_run() {
		return 'NO!'
	}

	async generateTurn(turn) {
		let world = this.parent.parent;
		let content = engine.content;
		let confluxTypeTpl = content.confluxTypes[this.values.confluxTypeId];

		let messages = [];
		messages.push({
			role: 'system',
			content: confluxTypeTpl.intro,
		});
		let scenarioTpl = content.scenarios[world.values.scenarioId];
		messages.push({
			role: 'system',
			content: scenarioTpl.lore,
		});
		let storyStorage = await world.get('stories');
		let stories = await storyStorage.getAll({ 'values.confluxId': this.id });
		messages.push({
			role: 'system',
			content: stories[0].values.seed,
		});
		messages.push({
			role: 'system',
			content: stories[1].values.seed,
		});

		let unitedRecords = [];
		for (let story of stories) {
			let storyRecordStorage = await story.get('records');
			let activeRecords = await storyRecordStorage.getAll({ 'values.recapped': { '$exists': false } });
			unitedRecords = unitedRecords.concat(activeRecords);
		}
		unitedRecords.sort((a, b) => {
			if (a.values.turn == b.values.turn) {
				return a.values.storyId.localeCompare(b.values.storyId);
			}
			return a.values.turn - b.values.turn;
		})
		for (let record of unitedRecords) {
			let story = record.parent.parent;
			messages.push({
				role: 'system',
				content: `${story.values.name}. ${world.getTurnName(record.values.turn)}.\n${record.values.content}`,
			});
		}
		let confluxRecordStorage = await this.get('records');
		let confluxRecords = await confluxRecordStorage.getAll();
		for (let record of confluxRecords) {
			messages.push({
				role: 'system',
				content: `${stories[0].values.name} and ${stories[1].values.name}. ${world.getTurnName(record.values.turn)}.\n${record.values.content}`,
			});
		}

		for (let story of stories) {
			let storyRecordStorage = await story.get('records');
			let storyCharacterStorage = await story.get('characters');
			let characters = await storyCharacterStorage.getAll();
			for (let character of characters) {
				if (character.values.chatId) {
					let conversation = await character.exportConversation();
					let conversationRecord = storyRecordStorage.createModel({
						values: {
							turn: story.values.turn,
							type: 'conversation',
							content: conversation,
						}
					});
					messages.push({
						role: 'system',
						content: conversation,
					})
					await conversationRecord.save();
				}
			}
		}

		messages.push({
			role: 'user',
			content: `Produce an united record for both cities for: ${world.getTurnName(world.values.turn + 1)}\nRemember to move plot forward`,
		});
		env.log(messages);
		let llmProvider = await engine.get('llmProviders.chatGpt');
		let answer =  await llmProvider.answer(messages);
		await confluxRecordStorage.createModel({
			values: {
				turn,
				type: 'chronicle',
				content: answer,
			},
		}).save();

		stories[0].values.turn = turn;
		stories[1].values.turn = turn;
		await stories[0].save();
		await stories[1].save();
		await this.save();
		env.log(answer);


		// let scenarioTpl = content.scenarios[world.values.scenarioId];
		// let storytellerTpl = content.storytellers[scenarioTpl.storytellerId];
		// messages.push({
		// 	role: 'system',
		// 	content: storytellerTpl.intro,
		// });
		// let records = await story.exportRecordsAsMessages();
		// messages = messages.concat(records);
		// messages.push({
		// 	role: 'user',
		// 	content: `Produce a record for: ${world.getTurnName(turn)}`,
		// });
		// let llmProvider = await engine.get('llmProviders.chatGpt');
		// return await llmProvider.answer(messages); // TODO: Добавить температуру
	}

}
