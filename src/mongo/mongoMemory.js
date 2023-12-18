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
	let newObj = { ...obj };
	if (newObj._id) {
		newObj.id = newObj._id;
		delete newObj._id;
	}
	return newObj;
}

function checkQuery(object, query) {
	for (let [ stringPath, value ] of Object.entries(query)) {
		let path = stringPath.split('.');
		let objectValue = objget(object, ...path);
		if (objectValue != value) {
			return false;
		}
	}
	return true;
}

function updateObject(object, updates) {
	for (let [ stringPath, value ] of Object.entries) {
		let path = stringPath.split('.');
		objset(object, value, ...path);
	}
}

module.exports = class MongoProvider extends getClass('dweller') {


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

	async insert(config, object) {
		assert(object.id, 'Implicit id is required');
		let collection = config.collection;
		await this.awaitCollection(collection);
		prepareQuery(object);
		let res = await this.database.collection(collection).insertOne(object);
		if (res.insertedId) {
			this.collections[collection].push(object);
		}
		return res;
	}

	async update(config, query, updates, params) {
		if (!updates) return;
		let collection = config.collection;
		await this.awaitCollection(collection);
		prepareQuery(query)
		let $set = {};
		for (let key in updates) {
			$set[key] = updates[key];
		}
		let res = await this.database.collection(collection).updateMany(query, { $set }, params);
		let objects = await this.getAll(config, query);
		for (let object of objects) {
			updateObject(object, updates);
		}
	}

	async getAll(config, query = {}) {
		let collection = config.collection;
		await this.awaitCollection(collection);
		prepareQuery(query);
		let res = this.findObjects(collection, query);
		return res.map(prepareObject);
	}

	async delete(config, query) {
		let collection = config.collection;
		await this.awaitCollection(collection);
		prepareQuery(query);
		let res = this.database.collection(config.collection).deleteMany(query);
		this.collections[collection] = this.collections[collection].filter(object => !checkQuery(object, query));
		return res;
	}
}
