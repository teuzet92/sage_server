module.exports = class extends getClass('shards/games/agents/agent') {

	async onTask(task) {
		let chancellorChatId = assert(this.parent.values.chancellorChatId);
		let chancellorChat = await this.project.get(`shards.chats.${chancellorChatId}`);
		let chancellorMessages = await chancellorChat.getMessages();
		let currentTurn = this.parent.values.turn;
		let turnName = this.parent.getTurnName(currentTurn);
		let stringChat = `Write the outcome of this conversation between The King and his chancellor that took place in ${turnName}:\n\n`;
		for (let message of chancellorMessages) {
			let role;
			if (message.role == 'system') continue;
			if (message.role == 'user') role = 'King';
			if (message.role == 'assistant') role = 'Chancellor';
			stringChat += `${role}: ${message.content}`;
		}
		let messages = [
			{
				role: 'user',
				content: await this.collectGameChronicle(),
			},
			{
				role: 'user',
				content: stringChat,
			},
		];
		let response = await this.providerCall(messages);
		if (response.search('NONE') > 0) return;
		return response;
	}
}
