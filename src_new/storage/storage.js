const Master = { callbacks: {} }

Master.greet = function() {
	env.log('GREET')
	env.log(this.config.greeting);
}

Master.createModel = function(model) {
	if (!model.id) {
		model.id = uuid(); // TODO: добавить провайдера айдишек
	}
	// Зачем тут кэширование?
	// let cached = this.checkDwellerCache(model.id);
	// if (cached) return cached;
	let classname = `${this.classname}._id`;
	return this.createChild(model, classname);
}

Master.resolveChild = function(childId) {
	let childConfig = this.config.model
	assert(childConfig, `Dweller ${this.fullId} has no model config`);
	let cached = this.checkDwellerCache(childId);
	if (cached) return cached;
	let classname = this.classname ? `${this.classname}.${childId}` : childId;
	let child =  this.createChild(childId, classname);
	if (child.needsLoading) {
		return child.needsLoading;
	}
	return child;
}

Master.callbacks.onInit = function(data) {
	env.log('onInit!')
	env.log(this.fullId)
}

module.exports = Master;
