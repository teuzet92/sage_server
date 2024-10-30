let getVar = function(varName) {
	assert(this.vars, `Dweller '${this.fullId}' has not loaded it's vars yet. Try again later.`);
	return this.vars[varName] ?? 0;
}

let setVar = function (varName, value) {
	assert(this.vars, `Dweller '${this.fullId}' has not loaded it's vars yet. Try again later.`);
	this.vars[varName] = value;
	let dwellerVarsStrorage = engine.get('vars');
	let query = { dwellerId: this.fullId, 'values.varName': varName };
	let update = { 'values.value': value };
	dwellerVarsStrorage.providerCall('update', query, update, { upsert: true });
}

onInit = async function () {
	let dwellerVarsStrorage = engine.get('vars');
	varModels = await dwellerVarsStrorage.getAll({ dwellerId: this.fullId });
	let vars = {};
	for (let varModel of varModels) {
		vars[varModel.values.varName] = varModel.values.value;
	}
	this.vars = vars;
}

module.exports = {
	callbacks: {
		onInit,
	},
	methods: {
		getVar,
		setVar,
	}
}
