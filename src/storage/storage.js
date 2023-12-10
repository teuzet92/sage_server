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

	cmd_getSchema() {
		return this.getSchema();
	}

	cmd_insert({ model }) {
		return this.insert(model);
	}

	insert(model = {}) {
		if (this.config.forceUuids) {
			assert(!model.id, 'Impossible to implicit ID for model in storage with forced uuids');
			model.id = uuid();
		}
		// TODO: Проверять данные на соответствие схеме
		assert(model.id, 'Id is required');
		model.createTime = Date.now();
		return this.provider.insert(this.config.providerConfig, model);
	}

	updateOne(query, updates, params) {
		let $set = {};
		for (let key of Object.keys(updates)) {
			$set[`data.${key}`] = updates[key];
		}
		return this.provider.updateOne(this.config.providerConfig, query, { $set }, params);
	}

	cmd_find({ query }) { 
		return this.find(query) 
	}

	find(query) {
		return this.provider.find(this.config.providerConfig, query);
	}

	findOne({ query }) {
		return this.provider.findOne(this.config.providerConfig, query);
	}

	deleteOne({ query }) {
		return this.provider.deleteOne(this.config.providerConfig, query);
	}
}
