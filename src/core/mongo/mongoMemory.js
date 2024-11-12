const { MongoClient } = require("mongodb");
const databaseUrl = process.env.ATLAS_URL;
const { prepareQuery, prepareResult } = require('./utils');

function checkOperator(operator, operatorQuery, value) {
	if (operator == '$exists') {
		return (value == undefined) != operatorQuery;
	}
	if (operator == '$ne') {
		return (value != operatorQuery);
	}
	if (operator == '$in') {
		for (let v of operatorQuery) {
			if (value == v) return true;
		}
		return false;
	} 
}

function checkQuery(object, query) {
	for (let [ stringPath, targetValue ] of Object.entries(query)) {
		let path = stringPath.split('.');
		let objectValue = objget(object, ...path);
		if (typeof targetValue == 'object') {
			for (let [ operator, operatorQuery ] of Object.entries(targetValue)) {
				if (!checkOperator(operator, operatorQuery, objectValue)) {
					return false
				}
			}
		} else {
			if (objectValue != targetValue) {
				return false;
			}
		}
	}
	return true;
}

function updateObject(object, updates) {
	for (let [ stringPath, value ] of Object.entries(updates)) {
		let path = stringPath.split('.');
		objset(object, value, ...path);
	}
}

module.exports = class MongoMemoryProvider extends getClass('dweller') {

	init(data) {
		let config = this.config;
		assert(config.db);
		this.collections = {};
		this.client = new MongoClient(databaseUrl);
		this.database = this.client.db(config.db);
	}

	findObjects(collection, query) {
		let objects = this.collections[collection];
		let res = [];
		for (let object of objects) {
			if (checkQuery(object, query)) {
				res.push(object);
			}
		}
		return res;
	}

	async awaitCollection(collection) {
		if (this.collections[collection]) return;
		this.collections[collection] = await this.database.collection(collection).find().toArray();
	}

	async insert(config, query) {
		assert(query.id, 'Implicit id is required');
		let collection = config.collection;
		await this.awaitCollection(collection);
		let preparedQuery = prepareQuery(query);
		let res = await this.database.collection(collection).insertOne(preparedQuery);
		if (res.insertedId) {
			this.collections[collection].push(preparedQuery);
		}
		return res;
	}

	async insertMany(config, queries = []) {
		let collection = config.collection;
		await this.awaitCollection(collection);
		let preparedQueries = queries.map(prepareQuery);
		let res = await this.database.collection(config.collection).insertMany(preparedQueries);
		this.collections[collection].push(...preparedQueries);
		return res;
	}

	async update(config, query, updates, params) {
		if (!updates) return;
		let collection = config.collection;
		await this.awaitCollection(collection);
		let preparedQuery = prepareQuery(query)
		let $set = {};
		for (let key in updates) {
			if (key == 'id') continue;
			$set[key] = updates[key];
		}
		let res = await this.database.collection(collection).updateMany(preparedQuery, { $set }, params);
		let objects = await this.getAll(config, preparedQuery);
		for (let object of objects) {
			updateObject(object, updates);
		}
	}

	async getAll(config, query) {
		let collection = config.collection;
		await this.awaitCollection(collection);
		let preparedQuery = prepareQuery(query);
		let res = this.findObjects(collection, preparedQuery);
		return res.map(prepareResult);
	}

	async delete(config, query) {
		let collection = config.collection;
		await this.awaitCollection(collection);
		let preparedQuery = prepareQuery(query);
		let res = this.database.collection(config.collection).deleteMany(preparedQuery);
		this.collections[collection] = this.collections[collection].filter(object => !checkQuery(object, preparedQuery));
		return res;
	}
}
