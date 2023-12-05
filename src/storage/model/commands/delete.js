module.exports = class extends getClass('api/command') {
	run(params) {
		let model = this.parent;
		let storage = model.parent;
		return storage.deleteOne({ id: model.id });
	}
}
