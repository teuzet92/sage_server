module.exports = class extends getClass('storage/storage') {

	cmd_newGame(data) {
		return this.newGame(data);
	}

	async newGame({ scenarioId, cityName, playerId }) {

		let game = this.createModel({
			values: {
				playerId,
				cityName,
				scenarioId,
			},
		});
		await game.save();
		return game.saveData();
	}

}
