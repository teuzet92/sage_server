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

	insert(query = {}) {
		let forceUuids = this.config.forceUuids;
		if (forceUuids) {
			assert(!query.id, 'Impossible to implicit ID for model in storage with forced uuids');
			query.id = uuid();
			return this.provider.insert(this.config.providerConfig, query);
		}
		assert(query.id, 'Id is required');
		return this.provider.insert(this.config.providerConfig, query);
	}

	update(query) {
		return this.provider.update(this.config.providerConfig, query);
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
