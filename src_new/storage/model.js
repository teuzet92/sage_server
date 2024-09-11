const Master = { callbacks: {} }

Master.initState = function(data) {
	this.createTime = data.createTime;
	this.updateTime = data.updateTime;
	this.values = data.values ?? {};
}

Master.onInit = function(data) {
	if (data.createTime) { 
		// Передали какие-то сохраненные данные из БД.
		// Доверяем создавшему родителю
		this.initState(data);
		return;
	}
	// Если данных не получили
	// this.needsLoading = new Promise((resolve, reject) => {
	// 	this.dbProviderCall('getAll', { id: this.id }).then(models => {
	// 		let [ myData ] = models;
	// 		this.initState(myData);
	// 		resolve(this);
	// 		delete this.needsLoading;
	// 	})
	// });
}

Master.saveData = function() {
	let out = {
		id: this.id,
		fullId: this.fullId,
		parentId: this.parent.fullId,
		createTime: this.createTime,
		updateTime: this.updateTime,
		classname: this.classname,
		values: this.values,
	};
	return out;
}

Master.save = function() {
	if (!this.createTime) {
		this.createTime = this.time();
		var creation = true;
	}
	let saveData = this.saveData();
	let dbCollection = this.config.dbCollection;
	let dbProviderId = this.config.dbProvider;
	let dbProvider = engine.get(dbProviderId);
	if (creation) {
		return this.dbProviderCall('insert', saveData);
	} else {
		saveData.updateTime = this.time();
		return this.dbProviderCall('update', { id: this.fullId }, saveData)
	}
}

Master.api_get = function() {
	return this.saveData();
}

Master.api_getSchema = function() {
	return this.config.schema;
}

module.exports = Master;
