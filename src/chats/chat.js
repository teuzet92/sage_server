module.exports = class extends getClass('storage/model/model') {

	async pushMessages(messages) {
		let messageStorage = await this.get('messages');
		for (let message of messages) {
			let messageModel = messageStorage.createModel({ values: message });
			await messageModel.save();
		}
	}

	cmd_continue() {
		return this.continue();
	}

	async continue() {
		let messageStorage = await this.get('messages');
		let messageModels = await messageStorage.getAll();
		let messages = [];
		for (let messageModel of messageModels) {
			messages.push({
				role: messageModel.values.role,
				content: messageModel.values.content,
			})
		};
		let llmProvider = await engine.get('llmProviders.chatGpt');
		let answer = await llmProvider.answer(messages);
		await this.pushMessages([
			{
				time: this.time(),
				role: 'assistant',
				content: answer,
			}
		]);
		return answer;
	}

	cmd_say({text}) {
		return this.say(text);
	}

	async say(text) {
		await this.pushMessages([{
			time: this.time(),
			role: 'user',
			content: text,
		}])
		return this.continue();
	}
}
