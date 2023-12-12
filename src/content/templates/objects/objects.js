module.exports = class extends getClass('storage/storage') {

	async getSchema() {
		let templateId = this.parent.id;
		let templateParamsStorage = await this.project.get('content.templateParams');
		let myParams = await templateParamsStorage.getAll({ 'values.templateId': templateId });
		let objectTitleField = this.parent.values.objectTitleField
		let fields = {};
		for (let paramObject of myParams) {
			let { code, title, type } = paramObject.values;
			fields[code] = {
				code,
				title,
				type,
			};
		}
		return {
			fields,
			objectTitleField: this.parent.values.objectTitleField,
		}
	}

	createModel(model) {
		model.templateId = this.parent.id;
		return super.createModel(model);
	}

	providerCall(method, query = {}, ...params) {
		query.templateId = this.parent.id;
		return super.providerCall(method, query, ...params);
	}

}
