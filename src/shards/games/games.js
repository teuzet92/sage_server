module.exports = class extends getClass('storage/storage') {

	cmd_newGame(data) {
		return this.newGame(data);
	}

	async newGame({ scenarioId, cityName, playerId }) {
		if (!scenarioId) {
			scenarioId = this.project.content.gameSettings.defaultScenario;
		}
		let scenario = assert(this.project.content.scenarios[scenarioId], `No scenario with id '${scenarioId}'`);
		let year = scenario.startingYear;
		let season = 0;

		return this.createModel({
			values: {
				playerId,
				cityName,
				year,
				season,
				scenarioId,
			},
		})
	}

}
