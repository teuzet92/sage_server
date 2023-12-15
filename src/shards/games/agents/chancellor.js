module.exports = class extends getClass('shards/games/agents/agent') {

	async onTask(task) {
		let chatId = this.parent.values.chancellorChatId;
		let chatModel = await this.project.get(`shards.chats.${chatId}`);
		let chatMessages = await chatModel.getMessages();
		let messages = [
			{
				role: 'user',
				content: await this.collectGameChronicle(),
			},
			...chatMessages,
			{
				role: 'user',
				content: task,
			},
		];
		let response = await this.providerCall(messages);
		await chatModel.addMessage('user', task);
		await chatModel.addMessage('assistant', response);
		return response;
	}
}
