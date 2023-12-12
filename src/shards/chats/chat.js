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
		const response = await openai.chat.completions.create({
			model: "gpt-3.5-turbo",
			messages,
		});
		let answer = response.choices[0].message;
		let answerModel = messageStorage.createModel({ values: answer });
		await answerModel.save();
		return answer.content;
	}

}
