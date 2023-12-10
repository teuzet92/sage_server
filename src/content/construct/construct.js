module.exports = class extends getClass('api/command') {

	async constuctContent() {
		let res = {};
		let templatesStorage = await this.project.get('content.templates');
		let templates = await templatesStorage.find();
		for (let templateData of templates) {
			res[templateData.id] = await this.constructTemplate(templateData);
		}
		return res;
	}

	async constructObject(objectData, schema) {
		let res = {
			id: objectData.id,
		};
		for (let field of schema) {
			res[field.code] = objectData.data[field.code];
		}
		return res;
	}

	async constructTemplate(templateData) {
		let res = {};
		let templateId = templateData.id;
		let templateModel = await this.project.get(`content.templates.${templateId}`);
		let objectsStorage = await templateModel.get('objects');
		let objects = await objectsStorage.find();
		let schema = await objectsStorage.getSchema();
		for (let objectData of objects) {
			res[objectData.id] = await this.constructObject(objectData, schema);
		}
		return res;
	}

	run(params) {
		return this.constuctContent();
	}
}
