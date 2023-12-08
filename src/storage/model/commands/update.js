module.exports = class extends getClass('api/command') {
	run({ data }) {
		let model = this.parent;
		let storage = model.parent;
		delete data.id;
		return storage.updateOne({ id: model.id }, { $set: data });
	}
}
