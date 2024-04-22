module.exports = class extends getClass('storage/model/model') {

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
		});
		await this.save();
		for (let story of activeStories) {
			await story.generateTurn(newTurn);
		}
	}
}
