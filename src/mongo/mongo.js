const { MongoClient } = require("mongodb");
const databaseUrl = process.env.ATLAS_URL;

function prepareQuery(query) {
	if (query.id) {
		query._id = query.id;
		delete(query.id);
	}
}

function prepareObject(obj) {
	if (!obj) return obj;
	if (obj._id) {
		obj.id = obj._id;
		delete obj._id;
	}
	return obj;
}

module.exports = class MongoProvider extends getClass('dweller') {

	init(data) {
		let config = this.config;
		assert(config.db);
		this.client = new MongoClient(databaseUrl);
		this.database = this.client.db(config.db);
	}

	insert(config, query) {
		assert(query.id, 'Implicit id is required');
		prepareQuery(query);
		return this.database.collection(config.collection).insertOne(query);
	}

	update(config, query, updates, params) {
		if (!updates) return;
		prepareQuery(query)
		let $set = {};
		for (let key in updates) {
			$set[key] = updates[key];
		}
		return this.database.collection(config.collection).updateMany(query, { $set }, params);
	}

	async getAll(config, query = {}) {
		prepareQuery(query);
		let res = await this.database.collection(config.collection).find(query).toArray();
		return res.map(prepareObject);
	}

	delete(config, query) {
		prepareQuery(query);
		return this.database.collection(config.collection).deleteMany(query);
	}
}
