const OpenAI = require('openai');
const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

module.exports = class extends getClass('storage/model/model') {
	cmd_continue() {
		return this.continue();
	}

	cmd_addMessage({ role, content }) {
		return this.addMessage(role, content);
	}

	async start() {
		let agent = await this.project.get(`content.templates.chatAgents.objects.${this.values.agentId}`);
		let intro = agent.values.intro;
		if (intro) {
			await this.addMessage('system', intro);
		}
		await this.save();
	}

	async addMessage(role, content) {
		let messageStorage = await this.get('messages');
		let values = { role, content };
		let message = messageStorage.createModel({ values });
		await message.save();
	}

	async continue() {
		let messageStorage = await this.get('messages');
		let messageModels = await messageStorage.getAll();
		let messages = [];
		for (let messageModel of messageModels) {
			let { role, content } = messageModel.values;
			messages.push({ role, content });
		}
		let agent = await this.project.get(`content.templates.chatAgents.objects.${this.values.agentId}`);
		let reminder = agent.values.reminder;
		if (reminder) {
			messages.push({
				role: 'system',
				content: reminder,
			});
		}
		console.log(messages);
		const response = await openai.chat.completions.create({
			model: "gpt-3.5-turbo",
			messages,
		});
		let answer = response.choices[0].message;
		await this.addMessage(answer.role, answer.content);
		return answer.content;
	}

}
