const { MongoClient } = require("mongodb");
const databaseUrl = process.env.ATLAS_URL;
const { prepareQuery, prepareResult, createBulkPromise } = require('./utils');

module.exports = class MongoProvider extends getClass('dweller') {

	init(data) {
		let config = this.config;
		assert(config.db);
		this.client = new MongoClient(databaseUrl);
		this.database = this.client.db(config.db);
	}

	startBulk() {
		assert(!this.bulkWrite, 'Bulk mode is already on');
		this.bulkWrite = [];
	}

	stopBulk() {
		assert(this.bulkWrite, 'Bulk mode is off');
		delete this.bulkWrite;
	}

	addBulkOperation(collection, operator, data) {
		let promise = createBulkPromise();
		let operation = {};
		operation[operator] = data;
		this.bulkWrite.push({
			collection,
			operation,
			promise,
		});
		return promise.promise;
	}

	async executeBulk() {
		assert(this.bulkWrite, 'Bulk mode if off');
		let bulk = this.bulkWrite;
		while (bulk.length > 0) {
			let nextBulk = [];
			let collection = bulk[0].collection;
			while (bulk.length > 0 && bulk[0].collection == collection) {
				nextBulk.push(bulk.shift());
			}
			let operations = nextBulk.map(entry => entry.operation);
			let promises = nextBulk.map(entry => entry.promise);
			await this.database.collection(collection).bulkWrite(operations);
			for (let { resolve } of promises) {
				await resolve(); // TODO: точно ли await
			}
		}
	}

	insert(config, query) {
		assert(query.id, 'Implicit id is required');
		let preparedQuery = prepareQuery(query);
		let collection = config.collection;
		if (!this.bulkWrite) {
			return this.database.collection(collection).insertOne(preparedQuery);
		}
		return this.addBulkOperation(collection, 'insertOne', preparedQuery);
	}

	insertMany(config, queries = []) {
		assert(!this.bulkWrite, 'insertMany is not supported for bulk mode');
		let preparedQueries = queries.map(prepareQuery);
		return this.database.collection(config.collection).insertMany(preparedQueries);
	}

	updateOne(config, query, updates, params) {
		if (!updates) return;
		let collection = config.collection;
		let preparedQuery = prepareQuery(query)
		let $set = {};
		delete updates.id;
		for (let key in updates) {
			$set[key] = updates[key];
		}
		if (!this.bulkWrite) {
			return this.database.collection(collection).updateOne(preparedQuery, { $set }, params);
		}
		return this.addBulkOperation(collection, 'updateOne', {
			filter: preparedQuery,
			update: { $set },
			...params,
		});
	}

	async getAll(config, query) {
		let preparedQuery = prepareQuery(query);
		let res = await this.database.collection(config.collection).find(preparedQuery).toArray();
		return res.map(prepareResult);
	}

	delete(config, query) {
		let preparedQuery = prepareQuery(query);
		let collection = config.collection;
		if (!this.bulkWrite) {
			return this.database.collection(collection).deleteMany(preparedQuery);
		}
		return this.addBulkOperation(collection, 'delete', preparedQuery)
	}
}
