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

	cmd_nextTurn() {

	}

	async nextTurn() {
		this.values.turn = this.values.turn + 1;
		
		await this.save();
	}

}
