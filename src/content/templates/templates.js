module.exports = class extends getClass('storage/storage') {

	cmd_createTemplate({ templateId }) {
		return this.createTemplate(templateId)
	}
	async createTemplate(templateId) {
		let template = this.createModel({
			id: templateId,
			values: {
				title: templateId,
			}
		});
		await template.save();
	}

}
