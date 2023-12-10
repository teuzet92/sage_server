const OpenAI = require('openai');
const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

const { getString } = require('./strings');

class ChatAgent {
	constructor(data = {}) {
		this.virtual = data.virtual;
		this.name = data.name || getString('unnamed_agent_name');
		this.chat = data.chat || [];
	}

	async ask(messages) {
		const response = await openai.chat.completions.create({
			model: "gpt-3.5-turbo",
			messages,
		});
		let answer = response.choices[0].message;
		return answer;
	}
}

module.exports = { ChatAgent }
