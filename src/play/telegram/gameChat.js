const slashCommand = require('slash-command');
const util = require('util');

const commands = {};

module.exports = class extends getClass('dweller') {

	async onMessage(userData, message) {
		let { userId, username } = userData;
		let playersStorage = await this.project.get('play.players');
		let playerModels = await playersStorage.getAll({ id: userId });
		let playerModel;
		if (playerModels.length == 0) {
			playerModel = await playersStorage.createModel({
				id: `${userId}`, // Грязный хак. Пока не умеем в числовые id
				values: {
					telegramUsername: username,
				},
			});
			await playerModel.save();
		} else {
			playerModel = playerModels[0]
		}
		let params = {};
		params.playerModel = playerModel;
		let gameId = playerModel.values.gameId;
		if (gameId) {
			params.gameModel = await this.project.get(`play.games.${gameId}`);
		}
		let { command, body } = slashCommand(message.text);
		if (command) {
			assert(this.config.apiActions[command], `Unknown command '${command}'. Use /help to see all possible commands.`)
			return this.runAction(command, params)
		} else {
			let gameModel = params.gameModel;
			if (!gameModel) {
				return 'You have no ongoing games. Use /new_game to start new game.'
			}
			if (!gameModel.values.scenarioId) {
				params.scenarioId = body;
				return this.setScenario(params);
			} else if (!gameModel.values.cityName) {
				params.cityName = body;
				return this.setCityName(params);
			} else {
				return gameModel.sayToChancellor(body);
			}
		}
	}

	async cmd_help() {
		let out = '';
		out += '/help - shows help\n';
		out += '/new_game - starts new game with default scenario\n';
		out += '/next - Fast forwards time to next season\n';
		out += '/new_scenario - starts new game with custom scenario (advanced users)\n';
		out += '/end_game - ends current game if present\n';
		out += 'When you have an ongoing game, all your messages that are not commands (plain messages without "/" at the beginning)'
		out += ' will be sent to your Chancellor. He is your main means of impacting your city fate.'
		return out
	}

	async cmd_start() {
		return 'Welcome to Cloudshire! Use /help to learn basics.'
	}

	async cmd_end_game({ playerModel }) {
		playerModel.values.gameId = null;
		await playerModel.save();
		return 'You have ended the game';
	}

	cmd_next({ gameModel }) {
		assert(gameModel, 'You have no ongoing games');
		return gameModel.next();
	}

	async setCityName({ gameModel, cityName }) {
		gameModel.values.cityName = cityName;
		return gameModel.start();
	}

	async setScenario({ gameModel, scenarioId }) {
		let scenariosStorage = await this.project.get('content.templates.scenarios.objects');
		let scenarios = await scenariosStorage.getAll({ 'values.code': scenarioId });
		let scenario = scenarios[0];
		if (!scenario) {
			return `Scenario with code '${scenarioId}' not found.`;
		} else {
			gameModel.values.scenarioId = scenarioId;
			await gameModel.save();
			return `You have selected scenario '${scenarioId}'. Now please enter city name:`;
		}
	}

	async cmd_new_game({ playerModel }) {
		let gamesStorage = await this.project.get('play.games');
		let gameModel = await gamesStorage.newGame({
			scenarioId: 'J24fe1KFQH',
			playerId: playerModel.id,
		})
		playerModel.values.gameId = gameModel.id;
		await playerModel.save();
		let out = 'New game will be started when you enter your city name.\n';
		out += 'It will take ~30 seconds to generate city. Please be patient.';
		out += 'Now please enter your city name:'
		return out;
	}

	async cmd_new_scenario({ playerModel }) {
		let gamesStorage = await this.project.get('play.games');
		let gameModel = await gamesStorage.newGame({
			playerId: playerModel.id,
		})
		playerModel.values.gameId = gameModel.id;
		await playerModel.save();
		return 'New game started. Please enter scenario ID.';
	}

}
