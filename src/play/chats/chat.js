module.exports = class extends getClass('storage/model/model') {
	cmd_addMessage({ role, content }) {
		return this.addMessage(role, content);
	}

	async addMessage(role, content) {
		let messageStorage = await this.get('messages');
		let values = { role, content };
		let message = messageStorage.createModel({ values });
		await message.save();
	}

	async getMessages() {
		let messageStorage = await this.get('messages');
		let messageModels = await messageStorage.getAll();
		let messages = [];
		for (let messageModel of messageModels) {
			let { role, content } = messageModel.values;
			messages.push({ role, content });
		}
		return messages;
	}

}
