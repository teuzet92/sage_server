module.exports = class extends getClass('storage/storage') {

	cmd_createTemplate({ templateId }) {
		return this.createTemplate(templateId)
	}
	createTemplate(templateId) {
		return this.createModel({
			id: templateId,
			values: {
				title: templateId,
			}
		});
	}

}
