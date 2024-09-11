global.classes = {};
global.traits = {};

const dweller = require('./dweller');

function loadTrait(traitName, config) {
	let prototype = require(`./${config.src}`);
	prototype.config = config;
	global.traits[traitName] = prototype;
}

// Добавляет трейт к классу
function addTrait(prototype, traitName, traitOverrideConfig) {
	let trait = traits[traitName];
	for (let [ propertyName, property ] of Object.entries(trait)) {
		if (propertyName == 'config') continue; // Не вмерживаем конфиг
		if (propertyName == 'callbacks') {
			for (let [ callbackName, callbackFunc ] of Object.entries(property)) {
				objinsert(prototype, callbackFunc, 'callbacks', callbackName)
			}
			continue;
		}
		prototype[propertyName] = property; // Переопределяем функцию из трейта
	}
	let traitDwellerConfig = trait.config.dwellerConfig;
	if (traitDwellerConfig) {
		objmerge(prototype.config, traitDwellerConfig, 'source');
	}
	if (traitOverrideConfig && typeof traitOverrideConfig == 'object') {
		objmerge(prototype.config, traitOverrideConfig, 'source');
	}
}


function loadClass(classname, config) {
	let prototype = Object.create(dweller);
	prototype.config = config;
	prototype.classname = classname;
	if (config.requiredTraits) {
		for (let [ traitName, traitOverrideConfig ] of Object.entries(config.requiredTraits)) {
			addTrait(prototype, traitName, traitOverrideConfig);
		}
	}
	global.classes[classname] = prototype;
	for (let [ node, nodeConfig ] of Object.entries(prototype.config)) {
		if (node[0] == '.') {
			loadClass(`${classname}${node}`, nodeConfig);
		}
	}
}

function loadClasses(config) {
	let traits = config.traits;
	if (traits) {
		for (let [ traitName, traitConfig ] of Object.entries(traits)) {
			loadTrait(traitName, traitConfig);
		}
	}
	for (let [ classname, classConfig ] of Object.entries(config)) {
		if (classname[0] != '.') continue;
		loadClass(classname.substring(1), classConfig);
	}
}

module.exports = loadClasses;