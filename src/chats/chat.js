module.exports = class extends getClass('storage/model/model') {

	async cmd_say({ text }) {
		let values = {
			role: 'user',
			content: text,
		}
		let message = this.get('messages').createModel({ values });
		await message.save();
		return this.continue();
	}

	cmd_continue() {
		return this.continue();
	}

	async continue() {
		let messageModels = await this.get('messages').getAll();
		let chat = [];
		for (let messageModel of messageModels) {
			chat.push({
				role: messageModel.values.role,
				content: messageModel.values.content,
			})
		}
		let provider = this.project.get('llmProviders.chatGpt'); // TODO: Добавить провайдеров
		return provider.answer(chat);
	}

	async addMessages(messages) {
		let messageStorage = await this.get('messages');
		for (let message of messages) {
			let messageModel = messageStorage.createModel({ values: message });
		}
	}

}
