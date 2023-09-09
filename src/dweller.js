class Dweller {
	constructor(data) {
		assert(data.id);
		assert(data.config);
		this.id = data.id;
		this.parent = data.parent;
		this.core = data.core;
		this.fullId = this.id;
		if (this.parent != this.core) {
			this.fullId = `${this.parent.fullId}.${this.fullId}`;
		}
		this.config = data.config;
	}

	create(data) {
		let childClassname = data.config.class;
		let childClass = getClass(childClassname);
		data.parent = this;
		data.core = this.core;
		return new childClass(data);
	}

	get(query) {
		assert(typeof query == 'string'); // Базовый двеллер работает только по прямому id дочернего объекта
		let fullIdParts = query.split('.');
		let nextChildId = fullIdParts.shift();
		let nextChildConfig = this.config[`.${nextChildId}`];
		assert(nextChildConfig, `Dweller '${nextChildId}' is not a valid child for '${this.fullId}'`)
		let nextChild = this.create({ id: nextChildId, config: nextChildConfig });
		if (fullIdParts.length == 0) {
			return nextChild;
		}
		return nextChild.get(fullIdParts.join('.'));
	}

	run() {
		throw new Error (`'run' is not implemented for ${this.fullId}`);
	}
}

module.exports = { Dweller };
