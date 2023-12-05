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
		if (this.config.cacheDweller) {
			this.project.cachedDwellers[this.fullId] = this;
		}
	}

	init(data) {}

	async create(data) {
		let childClassname = data.config.class;
		let childClass = getClass(childClassname);
		data.parent = this;
		data.project = this.project;
		let child = new childClass(data);
		await child.init(data);
		return child;
	}

	resolveChild(id) {}

	async get(query) {
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
				dweller = await dweller.create({ id: nextChildId, config: nextChildConfig });
			} else {
				dweller = await dweller.resolveChild(nextChildId);
			}
		}
		return dweller;
	}

	async tryRun(rawParams) {
		let defaultCommandId = assert(this.config.defaultCommand, `'tryRun' is not implemented for ${this.fullId}`);
		let defaultCommand = await this.get(defaultCommandId);
		return defaultCommand.tryRun(rawParams);
	}

	run(params) {
		throw new Error (`'run' is not implemented for ${this.fullId}`);
	}
}
