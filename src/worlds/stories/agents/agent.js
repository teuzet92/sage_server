module.exports = class extends getClass('storage/model/model') {
	

	async task(task) {
		return this.onTask(task);
	}

	async onTask(task) {
		return this.providerCall([
			{
				role: 'user',
				content: task,
			}
		])
	}

	async run() {
		error('Not implemented');
	}

	async providerCall(chat) {
		let messages = [];
		let intro = this.agent.values.intro;
		if (intro) {
			messages.push({
				role: 'system',
				content: intro,
			});
		};
		messages = messages.concat(messages, chat);
		let reminder = this.agent.values.reminder;
		if (reminder && this.config.llmProvider != 'llmProviders.mistral') { // TODO: support MistralAI
			messages.push({
				role: 'system',
				content: reminder,
			});
		};
		let temperature = this.agent.values.temperature ?? 1;
		temperature = Math.min(2, Math.max(0, temperature))
		let llmProviderId = 'llmProviders.chatGpt'
		if (this.agent.values.useMistralAsProvider) {
			llmProviderId = 'llmProviders.mistral';
			temperature = Math.min(1, Math.max(0, temperature));
		} 
		let llmProvider = await this.project.get(llmProviderId);
		return await llmProvider.answer(messages, temperature);
	}
}
