module.exports = class extends getClass('core/storage/storage') {

	generateModelId() {
		let content = engine.get('content');
		let lastId = content.getVar('lastObjectId');
		content.setVar('lastObjectId', lastId + 1);
		return lastId + 1;
	}

	async recalcSchema() {
		let templateId = this.parent.id;
		let paramsStorage = this.parent.get('params');
		let myParams = await paramsStorage.getAll();
		let modelTitle = this.parent.values.modelTitle;
		let fields = {};
		for (let paramObject of myParams) {
			let { code, title, type } = paramObject.values;
			fields[code] = {
				code,
				title,
				type,
			};
		};
		this.schema = {
			fields,
			modelTitle,
		};
	}

	async getSchema() {
		if (!this.schema) {
			await this.recalcSchema();
		}
		return this.schema;
	}
}
