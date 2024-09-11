const Master = { callbacks: {} }

Master.greet = function() {
	env.log('GREET')
	env.log(this.config.greeting);
}

Master.callbacks.onInit = function(data) {
	env.log('onInit!')
	env.log(this.fullId)
}

Master.api_greet = function() {
	return this.config.greeting;
}

module.exports = Master;