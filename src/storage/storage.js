module.exports = class extends getClass('dweller') {
	async init(data) {
		let defaultStorageConfig = this.project.config['storage'];
		objmerge(this.config, defaultStorageConfig, 'target');
		this.provider = await data.project.get('mongo');
	}

	async resolveChild(id) {
		let values = await this.findOne({ id });
		assert(values, 'Not a valid child')
		return this.create({
			id,
			config: this.config.model,
			values,
		})
	}

	getSchema() {
		return this.config.schema;
	}

	insert(newModel = {}) {
		if (this.config.forceUuids) {
			assert(!newModel.id, 'Impossible to implicit ID for model in storage with forced uuids');
			newModel.id = uuid();
		}
		// TODO: Проверять данные на соответствие схеме
		assert(newModel.id, 'Id is required');
		return this.provider.insert(this.config.providerConfig, newModel);
	}

	updateOne(query, updates, params) {
		let $set = {};
		for (let key of Object.keys(updates)) {
			$set[`data.${key}`] = updates[key];
		}
		return this.provider.updateOne(this.config.providerConfig, query, { $set }, params);
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
