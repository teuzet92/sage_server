module.exports = class extends getClass('storage/model/model') {

	async createChat() {
		let story = this.parent.parent;
		let world = story.parent.parent;
		let content = engine.content;
		let messages = [];
		let characterTypeTpl = assert(content.characterTypes[this.values.characterTypeId]);
		messages.push({
			role: 'system',
			content: characterTypeTpl.intro,
		});
		messages.push({
			role: 'system',
			content: `You are ${this.values.name}.\nYour bio:\n${this.values.bio}`,
		});
		messages.push({
			role: 'system',
			content: world.getLore(),
		});
		messages.push({
			role: 'system',
			content: story.values.seed,
		});
		let records = await story.getRecords();
		for (let record of records) {
			messages.push({
				role: 'system',
				content: record.values.content,
			});
		}
		let recordsStorage = await story.get('records');
		let activeRecords = await recordsStorage.getAll();
		for (let record of activeRecords) {
			messages.push({
				role: 'system',
				content: `${this.values.name}. ${world.getTurnName(record.values.turn)}.\n${record.values.content}`,
			});
		}
		let chatsStorage = engine.get('chats');
		let reason = `Chat with ${this.values.name} of ${story.values.name} at turn ${story.values.turn}`;
		let chat = chatsStorage.createModel({
			values: {
				reason,
			},
		})
		await chat.save();
		this.values.chatId = chat.id;
		await chat.pushMessages(messages);
		await this.save();
		return chat.id;
	}

	cmd_say({ message }) {
		return this.say(message);
	}

	async say(message) {
		let chatId = this.values.chatId;
		if (!chatId) {
			chatId = await this.createChat();
		}
		let chat = await engine.get(`chats.${chatId}`);
		return await chat.say(message);
	}

	async cmd_finalize() {
		return this.finalize();
	}

	// Финализирует разговор, внося в базу его и рекап.
	async finalize() {
		let chatId = assert(this.values.chatId, `No chat`);
		let story = this.parent.parent;
		let world = story.parent.parent;
		let content = engine.content;
		let turn = story.values.turn;
		let turnName = world.getTurnName(story.values.turn);
		let exportedConversationText = await this.exportConversation();
		let storyRecordStorage = await story.get('records');
		await storyRecordStorage.createModel({
			values: {
				turn,
				type: 'conversation',
				content: exportedConversationText,
			}
		}).save();

		let characterTypeTpl = assert(content.characterTypes[this.values.characterTypeId]);
		let finalizer = characterTypeTpl.finalizer;
		if (finalizer) {
			let messages = [];
			messages.push({
				role: 'system',
				content: finalizer,
			});
			messages.push({
				role: 'system',
				content: exportedConversationText,
			});
			let llmProvider = await engine.get('llmProviders.chatGpt');
			let conversationResult = await llmProvider.answer(messages);
			await storyRecordStorage.createModel({
				values: {
					turn,
					type: 'action',
					content: conversationResult,
				}
			}).save();
		}
		delete this.values.chatId;
		this.save();
	}

	async exportConversation() {
		let story = this.parent.parent;
		let world = story.parent.parent;
		let turn = story.values.turn;
		let turnName = world.getTurnName(story.values.turn);
		let text = `This conversation took place in ${turnName} between His Majesty and ${this.values.name}\n\n`;
		let chatId = this.values.chatId;
		if (!chatId) {
			return;
		}
		let messageStorage = await engine.get(`chats.${chatId}.messages`);
		let messages = await messageStorage.getAll();
		for (let message of messages) {
			if (message.values.role == 'assistant') {
				text += `${this.values.name}: ${message.values.content}\n`;
			} else if (message.values.role == 'user') {
				text += `His Majesty: ${message.values.content}\n`
			}
		}
		return text;
	}
}
