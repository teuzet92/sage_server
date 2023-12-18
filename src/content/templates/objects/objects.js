module.exports = class extends getClass('storage/storage') {

	async getSchema() {
		if (this.schema) return this.schema;
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
		this.schema = {
			fields,
			objectTitleField: this.parent.values.objectTitleField,
		}
		return this.schema
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
