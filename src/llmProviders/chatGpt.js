const OpenAI = require('openai');
const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

module.exports = class extends getClass('dweller') {
	async answer(messages, functions) {
		let tools
		if (functions) {
			tools = [];
			for (let func of functions) {
				tools.push({
					type: 'function',
					function: func,
				});
			}
		}
		const response = await openai.chat.completions.create({
			model: "gpt-3.5-turbo-0125",
			messages,
			temperature: 1,
			tools,
		});
		let answer = response;
		return answer;
	}
}
