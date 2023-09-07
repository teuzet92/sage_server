class Dweller {
	constructor(data) {
		assert(data.id);
		assert(data.config);
		this.id = data.id;
		this.config = data.config;
	}

	create(data) {
		let childClassname = data.config.class;
		let childClass = getClass(childClassname);
		data.parent = this;
		return new childClass(data);
	}

	get(query) {
		assert(typeof query == 'string'); // Базовый двеллер работает только по прямому id дочернего объекта
		let fullIdParts = query.split('.');
		let nextChildId = fullIdParts.shift();
		let nextChildConfig = this.config[`.${nextChildId}`];
		let nextChild = this.create({ id: nextChildId, config: nextChildConfig });
		if (fullIdParts.length == 0) {
			return nextChild;
		}
		return nextChild.get(fullIdParts.join('.'));
	}

	test() {
		env.log('Success!');
	}
}

module.exports = { Dweller };
