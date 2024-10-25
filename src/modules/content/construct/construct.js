module.exports = class extends getClass('dweller') {

	getObjectId(contentId) {
		let objectIds = this.objectIds;
		let numericId = objectIds[contentId];
		if (!numericId) {
			numericId = this.nextObjectId++;
			objectIds[contentId] = numericId;
		}
		return numericId;
	}

	getConstructorForParam(param) {
		let paramType = param.values.type.name;
		let constructorName = engine.config.datatypes[paramType].valueConstructor;
		if (!constructorName) {
			constructorName = this.config.defaultValueConstructor;
		}
		return this.get(`constructors.${constructorName}`);
	}

	isConstructionLocked() {
		return this.constructionLock;
	}

	async run(targetId) {
		assert(!this.isConstructionLocked(), 'Construction is locked');
		this.nextObjectId = 1;
		this.objectIds = {};
		this.constructionLock = true;
		let content = {};
		let templatesStorage = await engine.get('content.templates');
		let templateModels = await templatesStorage.getAll();
		for (let templateModel of templateModels) {
			content[templateModel.id] = await this.constructTemplate(templateModel, targetId);
		}
		delete this.constructionLock;
		return content;
	}

	constructObject(objectData, params) {
		let res = {
			id: this.getObjectId(objectData.id),
		};
		for (let param of Object.values(params)) {
			let constructor = this.getConstructorForParam(param);
			let rawValue = objectData.values[param.values.code];
			if (rawValue) { // TODO: Проверка получше? Или утащить в сборщик?
				res[param.values.code] = constructor.construct(rawValue)
			}
		}
		return res;
	}

	async constructTemplate(templateModel, targetId) {
		let templateId = templateModel.id;
		let objectsStorage = templateModel.get('objects');
		let paramsStorage = templateModel.get('params');
		let params = await paramsStorage.getAll();
		let objects = await objectsStorage.getAll();
		let constructedParams = [];
		for (let param of params) {
			let paramTargets = param.values.targets;
			if (paramTargets && paramTargets.find(target => targetId)) {
				constructedParams.push(param);
			}
		}
		if (constructedParams.length == 0) return;
		let res = {};
		for (let objectModel of objects) {
			let objectId = this.getObjectId(objectModel.id);
			let constructedObject = this.constructObject(objectModel, constructedParams);
			res[objectId] = constructedObject;
		}
		return res;
	}

	cmd_run({ targetId }) {
		return this.run(targetId);
	}
}
