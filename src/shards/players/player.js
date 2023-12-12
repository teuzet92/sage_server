module.exports = class extends getClass('storage/model/model') {

	getOngoingGame() {
		let gameId = this.values.gameId;
		if (!gameId) return;
		return this.project.get(`shards.games.${gameId}`);
	}

	cmd_start() {
		return 'START'
	}

	cmd_setModel({ modelCode }) {
		return 'MODEL'
	}

	async cmd_next() {
		let game = await this.getOngoingGame();
		if (!game) {
			return 'You have no ongoing games';
		}
		let resp = await game.next();
		return resp;
	}

	async cmd_addEvent({ text }) {
		let game = await this.getOngoingGame();
		if (!game) {
			return 'You have no ongoing games';
		}
		return await game.addEvent(text)
	}

	async cmd_newGame({ playerModel, cityName }) {
		let gamesStorage = await this.project.get('shards.games');
		let defaultScenario = this.project.content.gameSettings.defaultScenario;
		let response = await gamesStorage.newGame({
			modelId: defaultModel,
			playerId: playerModel.id,
			cityName,
		})
		playerModel.values.gameId = response.insertedId;
		await playerModel.save();
		return 'STARTED NEW GAME';
	}

}
