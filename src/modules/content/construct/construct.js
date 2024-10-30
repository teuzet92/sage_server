module.exports = class extends getClass('dweller') {

	getConstructorForParam(param) {
		let paramType = param.values.type.name;
		let constructorName = engine.config.datatypes[paramType].valueConstructor;
		if (!constructorName) {
			constructorName = this.config.defaultValueConstructor;
		}
		return this.get(`constructors.${constructorName}`);
	}

	async run(targetId) {
		assert(!this.constructionCtx, 'Construction is in progress');
		this.constructionCtx = { // Фиксируем контекст сборки
			templates: {},
			objects: {},
			// TODO: translations, resources, scripts
		};
		let targetModel = await this.getAsync(`targets.${targetId}`);
		assert(targetModel, `Unknown content target '${targetId}'`);
		let templatesStorage = engine.get('content.templates');
		let templateModels = await templatesStorage.getAll();
		for (let templateModel of templateModels) {
			let paramsStorage = templateModel.get('params');
			let rawParams = await paramsStorage.getAll();
			let params = []; // Собираем только параметры, которые положено собирать
			for (let param of rawParams) {
				let paramTargets = param.values.targets;
				if (paramTargets && paramTargets.find(target => targetId)) {
					params.push(param.saveData());
				}
			}
			let objectsStorage = templateModel.get('objects');
			let templateObjects = await objectsStorage.getAll();
			let objectIds = [];
			for (let objectModel of templateObjects) {
				objectIds.push(objectModel.id);
				this.constructionCtx.objects[objectModel.id] = objectModel.saveData();
			}
			this.constructionCtx.templates[templateModel.id] = {
				template: templateModel.saveData(),
				params,
				objectIds,
				constructed: {},
			};
		}
		for (let templateCtx of Object.values(this.constructionCtx.templates)) {
			for (let objectId of templateCtx.objectIds) {
				templateCtx.constructed[objectId] = await this.constructObject(objectId);
			}
		}
		let res = {};
		for (let templateCtx of Object.values(this.constructionCtx.templates)) {
			let template = templateCtx.template;
			let templateTargets = template.values.targets;
			if (templateTargets && templateTargets.find(target => targetId)) {
				let constructed = templateCtx.constructed;
				if (targetModel.values.templatesAsArray) {
					constructed = Object.values(constructed);
				}
				res[template.id] = constructed;
			}
		}
		let constructionCtx = this.constructionCtx;
		constructionCtx.res = res;
		delete this.constructionCtx;
		return constructionCtx

		return
	}

	async constructObject(objectId) {
		let constructionCtx = this.constructionCtx;
		let objectModel = assert(constructionCtx.objects[objectId], `No object '${objectId}' in construction context`);
		let templateId = objectModel.templateId;
		let templateCtx = constructionCtx.templates[templateId];
		let alreadyConstructed = templateCtx.constructed[objectId];
		if (alreadyConstructed) return alreadyConstructed;
		let res = {
			id: objectId,
		};
		for (let param of Object.values(templateCtx.params)) {
			let constructor = this.getConstructorForParam(param);
			let rawValue = objectModel.values[param.values.code];
			if (rawValue) { // TODO: Проверка получше? Или утащить в сборщик?
				res[param.values.code] = await constructor.construct(rawValue, param)
			}
		}
		templateCtx.constructed[objectId] = res;
		return res;
	}

	async cmd_run({ targetId }) {
		let ctx = await this.run(targetId);
		return ctx.res;
	}
}
