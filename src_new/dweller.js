const Master = {}

Master.init = function(data) {
	assert(data.id);
	this.id = data.id;
	this.parent = data.parent;
	this.engine = data.parent.engine;
	this.engine = data.engine;
	this.fullId = this.id;
	if (this.parent.fullId) {
		this.fullId = `${this.parent.fullId}.${this.id}`;
	}
	this.engine.cachedDwellers[this.fullId] = this;
	this.execAllTraits('onInit', data);
}

Master.execAllTraits = function(callbackName, ...args) {
	let callbacks = objget(this, 'callbacks', callbackName);
	if (!callbacks) return;
	for (let callback of callbacks) {
		callback.call(this, ...args);
	}
}

Master.createChild = function(id, classname) {
	let childClass = classes[classname];
	let data = { id, parent: this };
	let child = Object.create(childClass);
	child.init(data);
	return child;
}

Master.constructChildFullId = function(id) {
	return `${this.fullId}.${id}`;
}

Master.checkDwellerCache = function(id) {
	let fullId = this.constructChildFullId(id);
	return this.engine.dwellerCache(fullId);
}

Master.resolveChild = function(childId) {
	assert(`Dweller ${this.fullId} does not implement 'resolveChild'`);
}

Master.time = function() {
	return Date.now();
}

Master.get = async function(fullId) {
	let path = fullId.split('.');
	let dweller = this;
	let classname = this.classname;
	while (path.length > 0) {
		let nextChildId = path.shift();
		let nextChildConfig = dweller.config[`.${nextChildId}`];
		if (nextChildConfig) {
			let classname = dweller.classname ? `${dweller.classname}.${nextChildId}` : nextChildId;
			let child = dweller.createChild(nextChildId, classname);
			if (child.needsLoading) {
				await child.needsLoading;
			}
			dweller = child;
		} else {
			dweller = await dweller.resolveChild(nextChildId);
		}
	}
	if (dweller.needsLoading) {
		return dweller.needsLoading;
	}
	return dweller;
}

// TODO: Унести в трейт apiAccess?
Master.apiAction = function(action, data) {
	let actionConfig = assert(objget(this.config, 'apiActions', action), `Dweller ${this.fullId} does not have api action ${action}`);
	return this[`api_${action}`](data);
}

module.exports = Master;
