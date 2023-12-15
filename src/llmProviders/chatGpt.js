const OpenAI = require('openai');
const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

module.exports = class extends getClass('dweller') {
	async answer(messages, temperature = 1) {
		const response = await openai.chat.completions.create({
			model: "gpt-3.5-turbo",
			messages,
			temperature,
		});
		let answer = response.choices[0].message;
		return answer.content;
	}
}
