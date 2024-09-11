const Master = { callbacks: {} }

Master.dbProviderCall = async function(method, query = {}, ...params) {
	let dbCollection = this.config.dbCollection;
	let dbProviderId = this.config.dbProvider;
	let dbProvider = engine.get(dbProviderId);
	return dbProvider[method](dbCollection, query, ...params);
}

module.exports = Master;
