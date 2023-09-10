module.exports = class extends getClass('dweller') {

	onCreate() {
		let config = this.config;
		this.provider = this.project.get('mongo');
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
