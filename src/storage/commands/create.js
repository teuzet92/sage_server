module.exports = class extends getClass('api/command') {
	run(params) {
		let storage = this.parent;
		return storage.insert(params.data);
	}
}
