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

	createChild(data) {
		let childClassname = data.config.class;
		let childClass = getClass(childClassname);
		data.parent = this;
		data.project = this.project;
		let child = new childClass(data);
		child.init(data)
		return child;
	}

	resolveChild(query) {
		error(`Dweller '${this.fullId}' does not implement 'resolveChild'`);
	}

	async get(...path) {
		let fullPath = [];
		for (let pathNode of path) {
			if (typeof pathNode == 'string') {
				let splittedPath = pathNode.split('.');
				fullPath = fullPath.concat(splittedPath);
			} else {
				fullPath.push(pathNode);
			}
		}
		let dweller = this;
		while (fullPath.length > 0) {
			let nextChildQuery = fullPath.shift();
			let nextChildConfig
			if (typeof nextChildQuery == 'string') {
				nextChildConfig = dweller.config[`.${nextChildQuery}`];
			}
			let nextDweller;
			if (nextChildConfig) {
				nextDweller = await dweller.createChild({ id: nextChildQuery, config: nextChildConfig });
			} else {
				nextDweller = await dweller.resolveChild(nextChildQuery);
			}
			assert(nextDweller, `No child dweller with id '${nextChildQuery}' for dweller ${dweller.fullId}`);
			dweller = nextDweller;
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

	time() {
		return Date.now();
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
