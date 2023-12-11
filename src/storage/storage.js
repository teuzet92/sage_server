module.exports = class extends getClass('dweller') {
	async init(data) {
		let defaultStorageConfig = this.project.config['storage'];
		objmerge(this.config, defaultStorageConfig, 'target');
		this.provider = await data.project.get('mongo');
	}

	async resolveChild(id) {
		let objectData = await this.findOne({ id });
		assert(objectData, 'Not a valid child')
		return this.createChild({
			id,
			config: this.config.model,
			values: objectData.values,
		})
	}

	cmd_getSchema() {
		return this.getSchema();
	}
	getSchema() {
		return this.config.schema;
	}

	cmd_create({ model }) {
		return this.createModel(model);
	}

	createModel(model, id) {
		if (this.config.forceUuids) {
			assert(!id, 'Impossible to implicit ID for model in storage with forced uuids');
			model.id = uuid();
		}
		// TODO: Проверять данные на соответствие схеме
		assert(model.id, 'Id is required');
		model.createTime = Date.now();
		return this.provider.insert(this.config.providerConfig, model);
	}

	updateOne(query, updatedValues, params) {
		let $set = {};
		for (let key of Object.keys(updatedValues)) {
			$set[`values.${key}`] = updatedValues[key];
		}
		return this.provider.updateOne(this.config.providerConfig, query, { $set }, params);
	}

	cmd_find({ query }) { 
		return this.find(query) 
	}

	find(query) {
		return this.provider.find(this.config.providerConfig, query);
	}

	findOne(query) {
		return this.provider.findOne(this.config.providerConfig, query);
	}

	deleteOne(query) {
		return this.provider.deleteOne(this.config.providerConfig, query);
	}
}
