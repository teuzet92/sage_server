module.exports = class extends getClass('storage/model/model') {

	cmd_start() {
		return this.start();
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
		let world = this.parent.parent;
		let turn = world.values.turn + 1;
		this.generateTurn(turn);
		return 'DONE'
	}

	async generateTurn(turn) {
		let world = this.parent.parent;
		let content = engine.content;
		let confluxTypeTpl = content.confluxTypes[this.values.confluxTypeId];
		let storyStorage = await world.get('stories');
		let stories = await storyStorage.getAll({ 'values.confluxId': this.id });

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

		let story1 = stories[0];
		let story2 = stories[1];
		for (let story of stories) {
			await story.finalizeCharacters();
		}

		messages.push({
			role: 'system',
			content: story1.values.seed,
		});
		messages.push({
			role: 'system',
			content: story2.values.seed,
		});

		let unitedRecords = [];
		let story1RecordStorage = await story1.get('records');
		let activeRecords = await story1RecordStorage.getAll({ 
			'values.type': { '$in': [ 'action', 'event', 'chronicle', 'conflux' ]},
		});
		unitedRecords = unitedRecords.concat(activeRecords);
		let story2RecordStorage = await story2.get('records');
		activeRecords = await story2RecordStorage.getAll({ 
			'values.type': { '$in': [ 'action', 'event', 'chronicle', 'conflux' ]},
		});
		unitedRecords = unitedRecords.concat(activeRecords);

		let recordOrderByType = {
			'chronicle': 1,
			'conflux': 2,
			'event': 3,
			'action': 4,
		};

		unitedRecords.sort((a, b) => {
			if (a.values.turn != b.values.turn) {
				return a.values.turn - b.values.turn;
			}
			if (a.values.type != b.values.type) {
				return recordOrderByType[a.values.type] - recordOrderByType[b.values.type];
			}
			return a.values.storyId.localeCompare(b.values.storyId);
		})
		for (let record of unitedRecords) {
			let recordName = record.parent.parent.values.name;
			if (record.values.type == 'conflux') {
				recordName = `${story1.values.name} and ${story2.values.name}`;
			}
			messages.push({
				role: 'system',
				content: `${recordName}. ${world.getTurnName(record.values.turn)}.\n${record.values.content}`,
			});
		}
		messages.push({
			role: 'user',
			content: `Produce an united record for both cities for: ${world.getTurnName(world.values.turn + 1)}\nRemember to move plot forward`,
		});
		env.log(messages);
		let llmProvider = await engine.get('llmProviders.chatGpt');
		let answer =  await llmProvider.answer(messages);
		
		await story1RecordStorage.createModel({
			values: {
				turn,
				type: 'conflux',
				content: answer,
			},
		}).save();
		await story2RecordStorage.createModel({
			values: {
				turn,
				type: 'conflux',
				content: answer,
			},
		}).save();

		story1.values.turn = turn;
		story2.values.turn = turn;
		await story1.save();
		await story2.save();
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
