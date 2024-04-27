module.exports = class extends getClass('storage/model/model') {

	getTurnName(turn) {
		let year = Math.floor(turn / 4) + 1415; // TODO: константа из собранного контента
		const seasonNames = [
			'Spring',
			'Summer',
			'Autumn',
			'Winter',
		];
		let seasonIndex = turn % 4;
		let seasonName = seasonNames[seasonIndex];
		return `Year ${year}, ${seasonName}`;
	}

	getLore() {
		let content = engine.content;
		let scenarioTpl = content.scenarios[this.values.scenarioId];
		return `Game world lore and rules:\n${scenarioTpl.lore}`;
	}

	cmd_nextTurn() {
		return this.nextTurn()
	}

	async nextTurn() {
		let newTurn = this.values.turn + 1;
		this.values.turn = newTurn;
		let storiesStorage = await this.get('stories');
		let activeStories = await storiesStorage.getAll({ 
			'values.started': { '$exists': true },
			'values.finished': { '$exists': false },
			'values.confluxId': { '$exists': false }, 
		});
		for (let story of activeStories) {
			await story.generateTurn(newTurn);
		}

		let confluxStorage = await this.get('confluxes');
		let activeConfluxes = await confluxStorage.getAll({ 
			'values.startTurn': { '$exists': true },
		});

		for (let conflux of activeConfluxes) {
			await conflux.generateTurn(newTurn);
		}
		await this.save();
	}
}
