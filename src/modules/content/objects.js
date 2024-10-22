module.exports = class extends getClass('core/storage/storage') {

	async getSchema() {
		if (this.schema) return this.schema;
		let templateId = this.parent.id;
		let paramsStorage = this.parent.get('params');
		let myParams = await paramsStorage.getAll();
		let objectTitle = this.parent.values.objectTitle;
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
			objectTitle,
		};
		return this.schema;
	}
}
