module.exports = class extends getClass('dweller') {
	init(data) {
		let defaultStorageConfig = this.project.config['storage'];
		objmerge(this.config, defaultStorageConfig, 'target');
		let providerId = assert(this.config.provider, `Storage '${this.fullId}' has no provider`);
		this.provider = data.project.get(providerId);
	}

	resolveChild(id) {
		return this.createModel({ id });
	}

	async getSchema() {
		if (this.schema) return this.schema;
		let schema = {};
		objmerge(schema, this.config.schema);
		if (schema.provider) {
			let schemaProvider = await this.project.get(schema.provider);
			let providerSchema = await schemaProvider.getSchema();
			objmerge(schema, providerSchema)
		}
		this.schema = schema;
		return schema;
	}

	async providerCall(method, query = {}, ...params) {
		let provider = await this.provider;
		return provider[method](this.config.providerConfig, query, ...params);
	}

	createModel(model) {
		if (this.config.forceUuids && !model.id) {
			model.id = uuid();
		}
		// TODO: Проверять данные на соответствие схеме
		assert(model.id, 'Id is required');
		model.config = this.config.model;
		return this.createChild(model);
	}

	async getAll(query) {
		await this.load();
		let rawData = await this.providerCall('getAll', query);
		let res = [];
		for (let modelData of rawData) {
			let cached = this.cachedDwellers[modelData.id];
			if (cached) {
				cached.init({ ...modelData, loaded: true }); // Странный хак
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
}
