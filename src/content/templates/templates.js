module.exports = class extends getClass('storage/storage') {

	cmd_createTemplate({ templateId }) {
		return this.createTemplate(templateId)
	}
	createTemplate(templateId) {
		let storage = this.parent;
		return storage.insert({
			id: templateId,
			data: {
				title: templateId,
			}
		});
	}

}
