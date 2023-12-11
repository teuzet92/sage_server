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

	async createChild(data) {
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
		let fullIdParts = query.split('.');
		let dweller = this;
		while (fullIdParts.length > 0) {
			let nextChildId = fullIdParts.shift();
			let nextChildConfig = dweller.config[`.${nextChildId}`];
			if (nextChildConfig) {
				dweller = await dweller.createChild({ id: nextChildId, config: nextChildConfig });
			} else {
				dweller = await dweller.resolveChild(nextChildId);
			}
		}
		return dweller;
	}

	runAction(action, rawParams = {}) {
		let apiActionConfig = this.config.apiActions[action];
		assert(apiActionConfig);
		let parsedParams = this.parseApiParams(apiActionConfig, rawParams);
		let methodName = `cmd_${action}`;
		assert(this[methodName], `${this.fullId} does not implement API action ${action}`);
		return this[methodName](parsedParams);
	}

	parseApiParams(config, rawParams) {
		let out = {};
		let configParams = config.params;
		if (!configParams) return out;
		for (let [ paramName, paramConfig ] of Object.entries(configParams)) {
			let paramValue = rawParams[paramName];
			if (paramValue == undefined) {
				assert(!paramConfig.required, `Param '${paramName}' is required`);
			} else {
				let paramType = paramConfig.type;
				if (paramType == 'int') {
					paramValue = parseInt(paramValue);
					assert(!isNaN(paramValue), `Param ${paramName} must be a valid number`);
				}
				out[paramName] = paramValue;
			}
		}
		return out;
	}

	help() {} // Возвращает список команд
}
