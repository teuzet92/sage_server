module.exports = class extends getClass('dweller') {

	async constuctContent() {
		let content = {};
		let templatesStorage = await engine.get('content.templates');
		let templates = await templatesStorage.getAll();
		for (let templateData of templates) {
			content[templateData.id] = await this.constructTemplate(templateData);
		}
		let constructedContentStorage = await this.parent.get('constructed');
		let res = await constructedContentStorage.providerCall('update', { id: 'latest' }, { content }, { upsert: true });
		engine.content = content;
		return content;
	}

	async constructObject(objectData, schema) {
		let res = {
			id: objectData.id,
		};
		for (let field of Object.values(schema.fields)) {
			res[field.code] = objectData.values[field.code];
		}
		return res;
	}

	async constructTemplate(templateData) {
		let templateId = templateData.id;
		let templateModel = await engine.get(`content.templates.${templateId}`);
		let objectsStorage = await templateModel.get('objects');
		let objects = await objectsStorage.getAll();
		let schema = await objectsStorage.getSchema();
		let singleton = templateModel.values.singleton;
		if (singleton) {
			let objectData = objects[0];
			if (!objectData) return;
			return await this.constructObject(objectData, schema);
		}
		let res = {};
		for (let objectData of objects) {
			res[objectData.id] = await this.constructObject(objectData, schema);
		}
		return res;
	}

	cmd_run() {
		return this.run();
	}
	run() {
		return this.constuctContent();
	}
}
