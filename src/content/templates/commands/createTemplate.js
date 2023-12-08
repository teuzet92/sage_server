module.exports = class extends getClass('api/command') {
	run({ templateId }) {
		let storage = this.parent;
		return storage.insert({
			id: templateId,
			data: {
				title: templateId,
			}
		});
	}
}
