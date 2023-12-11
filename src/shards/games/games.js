module.exports = class extends getClass('storage/storage') {

	cmd_newGame(data) {
		return this.newGame(data);
	}

	async newGame({ modelId, cityName, playerId }) {
		let gameModel = assert(this.project.content.models[modelId], `No game model with id '${modelId}'`);
		let year = gameModel.startingYear;
		let season = 0;

		return this.createModel({
			values: {
				playerId,
				cityName,
				year,
				season,
				modelId,
			},
		})
	}

}
