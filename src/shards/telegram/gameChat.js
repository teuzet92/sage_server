const slashCommand = require('slash-command');
const util = require('util');

const commands = {};

module.exports = class extends getClass('dweller') {

	actionFromString(text) {
		let { command, body } = slashCommand(text);
		let res = {
			action: command,
			params: {},
		};
		let actionConfig = this.config.apiActions[command];
		assert(actionConfig)
		let parseStringParam = actionConfig.parseStringParam;
		if (parseStringParam) {
			res.params[parseStringParam] = body;
		}
		return res;
	}

	async onMessage(userData, message) {
		let { userId, username } = userData;
		let playerModel = await this.project.get(`shards.players.${userId}`);
		if (!playerModel) {
			let playersStorage = await this.project.get('shards.players');
			await playersStorage.createModel({
				id: `${userId}`, // Грязный хак. Пока не умеем в числовые id
				values: {
					telegramUsername: username,
				},
			});
			playerModel = await this.project.get(`shards.players.${userId}`);
		}
		let { action, params } = this.actionFromString(message.text);
		params.playerModel = playerModel;
		let gameId = playerModel.values.gameId;
		if (gameId) {
			params.gameModel = await this.project.get(`shards.games.${gameId}`);
		}
		return this.runAction(action, params);
	}


	async cmd_start() {
		return 'Welcome'
	}

	cmd_setModel({ modelCode }) {
		return 'MODEL'
	}

	cmd_next({ gameModel }) {
		assert(gameModel, 'You have no ongoing games')
		return gameModel.next();
	}

	cmd_addEvent({ gameModel, text }) {
		assert(gameModel, 'You have no ongoing games')
		return gameModel.addEvent(text)
	}

	async cmd_newGame({ playerModel, cityName }) {
		let gamesStorage = await this.project.get('shards.games');
		let response = await gamesStorage.newGame({
			modelId: this.project.content.gameSettings.defaultModel,
			playerId: playerModel.id,
			cityName,
		})
		playerModel.values.gameId = response.insertedId;
		await playerModel.save();
		return 'STARTED NEW GAME';
	}

}
