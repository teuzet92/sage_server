const { MongoClient } = require("mongodb");
const databaseUrl = process.env.ATLAS_URL;
const { prepareQuery, prepareResult } = require('./utils');

module.exports = class MongoProvider extends getClass('dweller') {

	init(data) {
		let config = this.config;
		assert(config.db);
		this.client = new MongoClient(databaseUrl);
		this.database = this.client.db(config.db);
	}

	insert(config, query) {
		assert(query.id, 'Implicit id is required');
		let preparedQuery = prepareQuery(prepareQuery);
		return this.database.collection(config.collection).insertOne(preparedQuery);
	}

	insertMany(queries = []) {
		let preparedQueries = queries.map(preparedQuery);
		return this.database.collection(config.collection).insertMany(preparedQueries);
	}

	update(config, query, updates, params) {
		console.log(query, updates)
		if (!updates) return;
		let preparedQuery = prepareQuery(query)
		let $set = {};
		delete updates.id;
		for (let key in updates) {
			$set[key] = updates[key];
		}
		return this.database.collection(config.collection).updateMany(preparedQuery, { $set }, params);
	}

	async getAll(config, query) {
		let preparedQuery = prepareQuery(query);
		let res = await this.database.collection(config.collection).find(preparedQuery).toArray();
		return res.map(prepareResult);
	}

	delete(config, query) {
		let preparedQuery = prepareQuery(query);
		return this.database.collection(config.collection).deleteMany(preparedQuery);
	}
}
