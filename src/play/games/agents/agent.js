module.exports = class extends getClass('storage/model/model') {
	
	async loadAgentData() {
		let scenario = await this.project.get(`content.templates.scenarios.objects.${this.parent.values.scenarioId}`);
		let scenarioAgentKey = this.config.scenarioAgentKey;
		let agentId = scenario.values[scenarioAgentKey];
		this.agent = await this.project.get(`content.templates.chatAgents.objects.${agentId}`);
	}

	async task(task) {
		await this.loadAgentData();
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

	async collectGameChronicle() {
		let game = this.parent;
		let out = 'Initial city description: \n';
		out += game.values.cityDescription;
		out += '\n\n';
		let chronicleRecords = await game.getChronicle();
		if (chronicleRecords.length > 0) {
			out += 'Chronicle of the city: \n';
			for (let chronicleRecordModel of chronicleRecords) {
				if (chronicleRecordModel.values.type == 'decision') {
					let turnName = game.getTurnName(chronicleRecordModel.values.turn);
					out += `IMPORTANT! ${turnName}.\n`;
				}
				out += chronicleRecordModel.values.content;
				out += '\n\n';
			} 
		}
		return out;
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
		let llmProviderId = 'llmProvider.chatGpt'
		if (this.agent.values.useMistralAsProvider) {
			llmProviderId = 'llmProvider.mistral';
			temperature = Math.min(1, Math.max(0, temperature));
		} 
		let llmProvider = await this.project.get(llmProviderId);
		return await llmProvider.answer(messages, temperature);
	}
}
