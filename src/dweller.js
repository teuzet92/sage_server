module.exports = class Dweller {
	constructor(data) {
		assert(data.id);
		assert(data.config);
		this.id = data.id;
		this.parent = data.parent;
		this.project = data.project;
		this.fullId = this.id;
		this.config = data.config;
		if (this.parent != this.project) {
			this.fullId = `${this.parent.fullId}.${this.fullId}`;
		}
		if (this.onCreate) {
			this.onCreate(data);
		}
		if (this.config.cacheDweller) {
			this.project.cachedDwellers[this.fullId] = this;
		}
	}

	create(data) {
		let childClassname = data.config.class;
		let childClass = getClass(childClassname);
		data.parent = this;
		data.project = this.project;
		return new childClass(data);
	}

	resolveChild(id) {
		throw new Error(`'resolveDweller' is not implemented for ${this.fullId}`)
	}

	get(query) {
		assert(typeof query == 'string'); // Базовый двеллер работает только по прямому id дочернего объекта
		if (this.project.cachedDwellers[query]) {
			return this.project.cachedDwellers[query];
		}
		let fullIdParts = query.split('.');
		let dweller = this;
		while (fullIdParts.length > 0) {
			let nextChildId = fullIdParts.shift();
			let nextChildConfig = dweller.config[`.${nextChildId}`];
			if (nextChildConfig) {
				dweller = dweller.create({ id: nextChildId, config: nextChildConfig });
			} else {
				dweller = dweller.resolveChild(nextChildId);
			}
		}
		return dweller;
	}

	run() {
		throw new Error (`'run' is not implemented for ${this.fullId}`);
	}
}
