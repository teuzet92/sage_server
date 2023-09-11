module.exports = class extends getClass('dweller') {

	constructor(data) {
		let defaultStorageConfig = data.project.config['storage'];
		objmerge(data.config, defaultStorageConfig, 'target');
		super(data);
		this.provider = this.project.get('mongo'); // TODO: Брать из конфига
	}

	resolveChild(id) {
		return this.create({
			id, // TODO: генерить, если пусто
			config: this.config.model,
		})
	}

	insert(query) {
		return this.provider.find(this.config.collection, query);
	}

	find(query) {
		return this.provider.find(this.config.collection, query);
	}

	delete(query) {
		return this.provider.delete(this.config.collection, query);
	}
}
