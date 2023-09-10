const { MongoClient } = require("mongodb");
const databaseUrl = process.env.ATLAS_URL;

module.exports = class MongoProvider extends getClass('dweller') {
	onCreate() {
		let config = this.config;
		assert(config.db);
		this.client = new MongoClient(databaseUrl);
		this.database = this.client.db(config.db);
	}

	insert(collection, query) {

	}


	update(collection, query) {

	}

	async find(collection, query = {}) {
		return await this.database.collection(collection).find(query).toArray()
	}

	delete(collection, query) {

	}
}
