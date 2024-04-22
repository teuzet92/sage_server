module.exports = class extends getClass('storage/model/model') {

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

	async startChat() {
		let story = this.parent.parent;
		let world = story.parent.parent;
		let content = this.project.content;
		let messages = [];
		let scenarioTpl = content.scenarios[world.values.scenarioId];
		let characterTypeTpl = assert(content.characterTypes[this.values.characterTypeId]);
		messages.push({
			role: 'system',
			content: characterTypeTpl.intro,
		});
		messages.push({
			role: 'system',
			content: `You are ${this.values.name}`,
		});
		messages.push({
			role: 'system',
			content: `Your bio:\n${this.values.bio}`,
		});
		let records = await story.exportRecordsAsMessages();
		messages = messages.concat(records);
		let chatsStorage = this.project.get('chats');
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
			chatId = await this.startChat();
		}
		let chat = await this.project.get(`chats.${chatId}`);
		return await chat.say(message);
	}

	async exportConversation() {
		let story = this.parent.parent;
		let turnName = this.getTurnName(story.values.turn);
		let text = `This conversation took place in ${turnName} between His Majesty and ${this.values.name}\n\n`;
		let chatId = this.values.chatId;
		if (!chatId) {
			return;
		}
		let messageStorage = await this.project.get(`chats.${chatId}.messages`);
		let messages = await messageStorage.getAll();
		for (let message of messages) {
			if (message.values.role == 'assistant') {
				text += `${this.values.name}: ${message.values.content}`;
			} else if (message.values.role == 'user') {
				text += `His Majesty: ${message.values.content}`
			}
		}
		delete this.values.chatId;
		await this.save();
		return text;
	}
}
