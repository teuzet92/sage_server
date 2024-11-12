const getModelTitle = (model, schema) => {
	function getFieldValue(match) {
		let fieldName = match.substring(1, match.length - 1);
		let fieldPath = fieldName.split('.');
		return objget(model, ...fieldPath);
	}
	let modelTitle = schema.modelTitle ?? '{id}';
	return modelTitle.replace(/\{[a-zA-Z0-9_]+(?:\.[a-zA-Z0-9_]+)*\}/g, getFieldValue);
}

module.exports = class extends getClass('dweller') {
	init(data) {
		let defaultStorageConfig = engine.config['storage'];
		objmerge(this.config, defaultStorageConfig, 'target'); // TODO: Тут происходит странное
		// На первом создании двеллера модифицируется конфиг в памяти
		// Надо придумать что с этим делать. Пока вроде нет последствий
		let providerId = assert(this.config.provider, `Storage '${this.fullId}' has no provider`);
		this.provider = engine.get(providerId);
	}

	async resolveChild(id) {
		let children = await this.providerCall('getAll', { id });
		assert(children.length > 0, `Storage ${this.fullId} has no model with id '${id}'`);
		return this.createModel(children[0]); // TODO: стоит ли проверять, что ровно один?
	}

	async getSchema() {
		if (!this.schema) {
			let schema = {};
			// TODO: Видоизменяем конфиг на первом обращении. Плохих последствий вроде пока нет
			objmerge(schema, this.config.schema);
			if (schema.provider) {
				let schemaProvider = await engine.get(schema.provider);
				let providerSchema = await schemaProvider.getSchema();
				objmerge(schema, providerSchema)
			}
			this.schema = schema;
		}
		return this.schema;
	}

	generateModelId() {
		return uuid();
	}

	async providerCall(method, query = {}, ...params) {
		let forcedIdPath = this.config.forceMyParentIdInModels;
		if (forcedIdPath) {
			query[forcedIdPath] = this.parent.id;
		}
		let provider = await this.provider;
		return provider[method](this.config.providerConfig, query, ...params);
	}

	createModel(model) {
		if (!model.id) {
			model.id = this.generateModelId();
		}
		// TODO: Проверять данные на соответствие схеме
		assert(model.id, 'Id is required');
		let forcedIdPath = this.config.forceMyParentIdInModels;
		if (forcedIdPath) {
			objset(model, this.parent.id, ...forcedIdPath.split('.'))
		}
		model.config = this.config.model;
		return this.createChild(model);
	}

	async getAll(query) {
		let rawData = await this.providerCall('getAll', query);
		let res = [];
		for (let modelData of rawData) {
			let cached = this.cachedDwellers[modelData.id];
			if (cached) {
				res.push(cached);
			} else {
				res.push(this.createModel(modelData))
			}
		}
		return res;
	}

	cmd_getSchema() {
		return this.getSchema();
	}

	async cmd_create({ values }) {
		let model = this.createModel({ values });
		await model.save();
		return model.saveData();
	}

	async cmd_getAll({ query }) { 
		let models = await this.getAll(query);
		return models.map(model => model.saveData());
	}

	async cmd_getModelTitles() { // TODO: Обновлять на сохранении модели
		if (!this.modelTitles) {
			let schema = await this.getSchema();
			let models = await this.getAll();
			let modelTitles = [];
			for (let model of models) {
				modelTitles.push({
					id: model.id,
					title: getModelTitle(model, schema),
				});
			}
			this.modelTitles = modelTitles;
		}
		return this.modelTitles;
	}

	async cmd_bulkUpdate({ models }) {
		// TODO: Выполняем очень неэффективно
		let modelDwellers = {};
		for (let { modelId, update, updateTime } of models) {
			// Проверяем все updateTime
			let model = await this.getAsync(`${modelId}`);
			assert(model.updateTime == updateTime, `Model ${modelId} has wrong updateTime. Expected: ${model.updateTime}, received: ${updateTime}`);
			modelDwellers[modelId] = model;
		}
		for (let { modelId, update, updateTime } of models) {
			// Применяем изменения
			let model = modelDwellers[modelId];
			await model.update(update, updateTime);
		}
	}
}
