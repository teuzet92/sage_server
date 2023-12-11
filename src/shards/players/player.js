module.exports = class extends getClass('storage/model/model') {

	getOngoingGame() {
		let gameId = this.values.gameId;
		if (!gameId) return;
		return this.project.get(`shards.games.${gameId}`);
	}

	cmd_start() {
		return 'START'
	}

	async cmd_next() {
		let game = await this.getOngoingGame();
		if (!game) {
			return 'You have no ongoing games';
		}
		let resp = await game.next();
		console.log('GAME NEXT RESP')
		console.log(resp)
		return resp;
	}

	async cmd_addEvent({ text }) {
		let game = await this.getOngoingGame();
		if (!game) {
			return 'You have no ongoing games';
		}
		return await game.addEvent(text)
	}

	async cmd_newGame({ cityName }) {
		let gamesStorage = await this.project.get('shards.games');
		let response = await gamesStorage.newGame({
			modelId: 'Sxv0QAyu0D',
			playerId: this.id,
			cityName,
		})
		this.values.gameId = response.insertedId;
		await this.save();
		return 'STARTED NEW GAME'
	}

}
