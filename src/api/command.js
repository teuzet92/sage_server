class Command extends getClass('dweller:Dweller') {
	
	parseParams(requestParams = {}) {
		let out = {};
		let configParams = this.config.params;
		if (!configParams) return out;
		for (let [ paramName, paramConfig ] of Object.entries(configParams)) {
			let paramValue = requestParams[paramName];
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

	run() {
		throw new Error('Base command run!');
	}
}

module.exports = { Command };
