module.exports = class extends getClass('api/command') {
	run({ data }) {
		let model = this.parent;
		let storage = model.parent;
		return storage.update({ id: model.id }, data);
	}
}
