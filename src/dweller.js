module.exports = class Dweller {
	
	constructor(data) {
		assert(data.id);
		assert(data.config);
		this.id = data.id;
		this.parent = data.parent;
		this.config = data.config;
		this.cachedDwellers = {};
		if (global.engine) {
			let defaultDwellerConfig = engine.config['dweller'];
			objmerge(this.config, defaultDwellerConfig, 'target');
		}
		this.fullId = this.id;
		if (this.parent && this.parent != engine && this.parent.fullId) {
			this.fullId = `${this.parent.fullId}.${this.fullId}`;
		}
	}

	init(data) {}

	async onLoad() {}

	async load() {
		if (this.loaded) return this;
		if (this.parent && !this.parent.loaded) {
			await this.parent.load();
		}
		await this.onLoad();
		this.loaded = true;
		return this;
	}

	createChild(data) {
		let childClassname = data.config.class;
		let childClass = getClass(childClassname);
		data.parent = this;
		let child = new childClass(data);
		child.init(data)
		this.cachedDwellers[data.id] = child;
		return child;
	}

	resolveChild(query) {}

	get(fullId) {
		let path = fullId.split('.');
		let dweller = this;
		while (path.length > 0) {
			let nextChildId = path.shift();
			let cached = dweller.cachedDwellers[nextChildId];
			if (cached) {
				dweller = cached;
				continue;
			}
			let nextChildConfig = dweller.config[`.${nextChildId}`];
			let nextDweller;
			if (nextChildConfig && nextChildConfig.class) {
				nextDweller = dweller.createChild({ id: nextChildId, config: nextChildConfig });
			} else {
				assert('Unable to use .get for dynamic dwellers. Use .getAsync method.');
			}
			assert(nextDweller, `No child dweller with id '${nextChildId}' for dweller ${dweller.fullId}`);
			dweller = nextDweller;
		}
		return dweller;
	}

	async getAsync(fullId) { // TODO: Как-то усреднить с get
		let path = fullId.split('.');
		let dweller = this;
		while (path.length > 0) {
			let nextChildId = path.shift();
			let cached = dweller.cachedDwellers[nextChildId];
			if (cached) {
				dweller = cached;
				continue;
			}
			let nextChildConfig = dweller.config[`.${nextChildId}`];
			let nextDweller;
			if (nextChildConfig && nextChildConfig.class) {
				nextDweller = dweller.createChild({ id: nextChildId, config: nextChildConfig });
			} else {
				nextDweller = await dweller.resolveChild(nextChildId);
			}
			assert(nextDweller, `No child dweller with id '${nextChildId}' for dweller ${dweller.fullId}`);
			dweller = nextDweller;
		}
		return dweller;
	}

	async runAction(action, rawParams = {}) {
		await this.load();
		let apiActionConfig = this.config.apiActions[action];
		assert(apiActionConfig, `No config for action ${action}`);
		let parsedParams = this.parseApiParams(apiActionConfig, rawParams);
		let methodName = apiActionConfig.interfaceMethodName || `cmd_${action}`; // TODO: прямой доступ
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

	cmd_help() {
		return this.help();
	}
	help() {
		return 'Help';
	}

	cmd_getConfig() {
		return this.getConfig();
	}

	getConfig() {
		return this.config;
	}

}
