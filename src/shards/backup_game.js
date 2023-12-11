const { ChatAgent } = require('./chatAgent');
const { getString } = require('./strings');

const { gameSettings } = require('./config');

const { mongo } = require('./mongo');

class Game {
	constructor(data = {}) {
		// City name
		this.userId = data.userId || 'Local';
		this.cityName = data.cityName || getString('default_city_name');
		this.id = data.id || uuid();
		this.date = data.date || {
			year: gameSettings.startingYear,
			season: gameSettings.startingSeason,
		};
		this.cityDescription = data.cityDescription || util.format(getString('city_description'), this.cityName);
		this.chat = data.chat || [];
		this.chatAgent = new ChatAgent({
			virtual: data.virtualAgent,
			name: getString('chat_name_chronist'),
		})
		if (data.mongo) {
			this.mongo = mongo;
		}
	}

	moveDate() {
		let date = this.date;
		date.season = date.season + 1
		if (date.season > 3) {
			date.season = 0;
			date.year = date.year + 1;
		}
		if (!this.mongo) return;
		this.mongo.updateOne('games', { id: this.id }, { $set: { date: this.date } });
	}

	getNextRecordMessage() {
		const seasonStrings = [
			'season_spring',
			'season_summer',
			'season_autumn',
			'season_winter',
		];
		let date = this.date;
		let seasonStringCode = seasonStrings[date.season];
		return util.format(getString('agent_prompt_next_data'), date.year, getString(seasonStringCode));
	}

	getSoundTitle() { //TODO: remove
		const seasonStrings = [
			'season_spring',
			'season_summer',
			'season_autumn',
			'season_winter',
		];
		let date = this.date;
		let seasonStringCode = seasonStrings[date.season];
		return `${this.cityName}. Year ${date.year}, ${getString(seasonStringCode)}`;
	}

	init() {
		if (this.mongo) {
			this.mongo.insertOne('games', {
				id: this.id,
				userId: this.userId,
				virtualAgent: this.virtualAgent,
				date: this.date,
				cityName: this.cityName,
				cityDescription: this.cityDescription,
			})
		}
		this.pushMessage({ role: 'system', content: getString('chronist_intro') });
		this.pushMessage({ role: 'system', content: this.cityDescription });
	}

	pushMessage(message) {
		this.chat.push(message);
		if (!this.mongo) return;
		this.mongo.insertOne('gameChatMessages', {
			id: uuid(),
			gameId: this.id,
			time: Date.now(),
			message,
		})
	}

	pushEvent(event) {
		this.pushMessage({
			role: 'user',
			content: event,
		})
	}

	async next() {
		let tmpChat = [...this.chat];
		tmpChat.push({
			role: 'system',
			content: getString('chronist_memo'),
		})
		tmpChat.push({
			role: 'system',
			content: this.getNextRecordMessage(),
		})
		let response = await this.chatAgent.ask(tmpChat);
		this.pushMessage(response);
		this.moveDate();
		return response;
	}
}

module.exports = { Game }
