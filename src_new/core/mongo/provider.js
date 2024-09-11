const Master = { callbacks: {} }
const { MongoClient } = require("mongodb");
const databaseUrl = process.env.ATLAS_URL;

function prepareQuery(query) {
	if (!query) return;
	let prepared = { ... query };
	if (prepared.id) {
		prepared._id = prepared.id;
		delete(prepared.id);
	}
	return prepared;
}

function prepareResult(obj) {
	if (!obj) return;
	let prepared = { ...obj };
	if (prepared._id) {
		prepared.id = prepared._id;
		delete prepared._id;
	}
	return prepared;
}

Master.callbacks.onInit = function(data) {
	let config = this.config;
	assert(config.db);
	this.client = new MongoClient(databaseUrl);
	this.database = this.client.db(config.db);
}

Master.insert = function(collection, query) {
	assert(query.id, 'Implicit id is required');
	let preparedQuery = prepareQuery(prepareQuery);
	return this.database.collection(collection).insertOne(preparedQuery);
}

Master.insertMany = function (collection, queries = []) {
	let preparedQueries = queries.map(preparedQuery);
	return this.database.collection(collection).insertMany(preparedQueries);
}

Master.update = function(collection, query, updates, params) {
	if (!updates) return;
	let preparedQuery = prepareQuery(query)
	let $set = {};
	for (let key in updates) {
		$set[key] = updates[key];
	}
	return this.database.collection(collection).updateMany(preparedQuery, { $set }, params);
}

Master.getAll = async function(query) {
	let preparedQuery = prepareQuery(query);
	let res = await this.database.collection(collection).find(preparedQuery).toArray();
	return res.map(prepareResult);
}

Master.delete = function(query) {
	let preparedQuery = prepareQuery(query);
	return this.database.collection(collection).deleteMany(preparedQuery);
}

module.exports = Master;
