module.exports = class extends getClass('dweller') {

	getConstructorForDatatype(datatype) {
		let fixedConstructorId = engine.config.datatypes[datatype.name].valueConstructor;
		// env.log(fixedConstructorId)
		if (fixedConstructorId) {
			return this.get(`constructors.${fixedConstructorId}`);
		}
		let out = { constructorId: this.config.defaultValueConstructor };
		this.execCallbacks('onGetConstructorForDatatype', datatype, out);
		return this.get(`constructors.${out.constructorId}`);
	}

	async run(targetId) {
		assert(!this.constructionCtx, 'Construction is in progress');
		this.constructionCtx = { // Фиксируем контекст сборки
			templates: {},
			objects: {},
			resources: {},
			// TODO: translations, resources, scripts
		};
		try {
			let resourceStorage = engine.get('resourceSystem.resources');
			let resources = await resourceStorage.getAll();
			for (let res of resources) {
				this.constructionCtx.resources[res.id] = res.values.resourceId;
			}
			let targetModel = await this.getAsync(`targets.${targetId}`);
			assert(targetModel, `Unknown content target '${targetId}'`);
			let templatesStorage = engine.get('content.templates');
			let templateModels = await templatesStorage.getAll();
			this.constructionCtx.target = targetModel;
			for (let templateModel of templateModels) {
				let targets = templateModel.values.targets;
				if (!targets) continue;
				if (!targets.includes(targetId)) continue;
				let paramsStorage = templateModel.get('params');
				let rawParams = await paramsStorage.getAll();
				let params = []; // Собираем только параметры, которые положено собирать
				for (let param of rawParams) {
					let paramTargets = param.values.targets;
					if (!paramTargets) continue;
					if (!paramTargets.includes(targetId)) continue;
					params.push(param.saveData());
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
			let content = {};
			for (let templateCtx of Object.values(this.constructionCtx.templates)) {
				let template = templateCtx.template;
				let templateTargets = template.values.targets;
				if (templateTargets && templateTargets.find(target => targetId)) {
					let constructed = templateCtx.constructed;
					if (template.values.singleton) {
						content[template.id] = Object.values(constructed)[0];
					}
					else {
						if (targetModel.values.templatesAsArray) {
							constructed = Object.values(constructed);
						}
						content[template.id] = constructed;
					}
				}
			}
			var constructionCtx = this.constructionCtx;
			constructionCtx.result = { content };
			await this.execCallbacks('onContentConstructed', constructionCtx);
		} catch (e) {
			throw e;
		} finally {
			delete this.constructionCtx;
			if (constructionCtx) {
				return constructionCtx.result
			}
		}
	}

	async constructObject(objectId) {
		let constructionCtx = this.constructionCtx;
		let objectData = assert(constructionCtx.objects[objectId], `No object '${objectId}' in construction context`);
		let templateId = objectData.templateId;
		let templateCtx = constructionCtx.templates[templateId];
		let alreadyConstructed = templateCtx.constructed[objectId];
		if (alreadyConstructed) return alreadyConstructed;
		let res = {
			id: objectId,
		};
		let path = ['content', 'templates', templateId, 'objects'];
		for (let param of Object.values(templateCtx.params)) {
			let paramType = param.values.type;
			let constructor = this.getConstructorForDatatype(paramType);
			let rawValue = objectData.values[param.values.code];
			res[param.values.code] = await constructor.construct(rawValue, paramType, path.concat([objectId]), constructionCtx)
		}
		templateCtx.constructed[objectId] = res;
		return res;
	}

	async cmd_run({ targetId }) {
		return await this.run(targetId);
	}
}
