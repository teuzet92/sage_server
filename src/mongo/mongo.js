const { MongoClient } = require("mongodb");
const databaseUrl = process.env.ATLAS_URL;

function prepareQuery(query) {
	if (query.id) {
		query._id = query.id;
		delete(query.id);
	}
}

function prepareObject(obj) {
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
		let collection = config.collection;
		return this.database.collection(collection).insertOne(query);
	}

	updateOne(config, query, updates) {
		prepareQuery(query);
		let collection = config.collection;
		return this.database.collection(collection).updateOne(query, updates);
	}

	async find(config, query = {}) {
		prepareQuery(query);
		let collection = config.collection;
		let res = await this.database.collection(collection).find(query).toArray();
		return res.map(prepareObject);
	}

	async findOne(config, query = {}) {
		prepareQuery(query);
		let collection = config.collection;
		let res = await this.database.collection(collection).findOne(query);
		return prepareObject(res);
	}

	deleteOne(config, query) {
		prepareQuery(query);
		let collection = config.collection;
		return this.database.collection(collection).deleteOne(query);
	}
}
