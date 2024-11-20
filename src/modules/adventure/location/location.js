module.exports = class extends getClass('core/storage/model') {

	async pushEvent(time, text) {
		let eventsStorage = this.get('events');
		let model = eventsStorage.createModel({
			values: { time, text },
		});
		await model.save();
	}

}
