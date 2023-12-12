module.exports = class extends getClass('dweller') {
	init(data) {
		let defaultStorageConfig = this.project.config['storage'];
		objmerge(this.config, defaultStorageConfig, 'target');
		this.provider = data.project.get('mongo');
	}

	async resolveChild(query) {
		let providerQuery
		if (typeof query == 'string') {
			providerQuery = { id: query };
		} else {
			providerQuery = query;
		}
		let [ childData ] = await this.providerCall('getAll', providerQuery, { limit: 1 });
		if (!childData) return;
		childData.config = this.config.model;
		return this.createChild(childData);
	}

	getSchema() {
		return this.config.schema;
	}

	async providerCall(method, query = {}, ...params) {
		let provider = await this.provider;
		return provider[method](this.config.providerConfig, query, ...params);
	}

	createModel(model) {
		// TODO: Проверять данные на соответствие схеме
		assert(model.id, 'Id is required');
		model.config = this.config.model;
		return this.createChild(model);
	}

	async getAll(query) {
		let rawData = await this.providerCall('getAll', query);
		return rawData.map(modelData => this.createModel(modelData));
	}

	cmd_getSchema() {
		return this.getSchema();
	}

	async cmd_create({ values }) {
		let id;
		if (this.config.forceUuids) {
			id = uuid();
		};
		let model = this.createModel({ id, values });
		await model.save();
		return model.saveData();
	}

	async cmd_getAll({ query }) { 
		let models = await this.getAll(query);
		return models.map(model => model.saveData());
	}
}
