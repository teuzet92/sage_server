process.chdir('./src/');
const YAML = require('yaml');
const fs = require('fs');

require('./core/util');
require('./core/env');

global.getClass = function(path) { // Трейты используют этот же метод
	return require(`./${path}`);
}

function parseConfig(configPath) {
	const configYaml = fs.readFileSync(configPath, 'utf8');
	const config = YAML.parse(configYaml);
	return config;
}

const loadedConfigs = {};
function loadConfig(modulePath) {
	if (loadedConfigs[modulePath]) return loadedConfigs[modulePath]; // Не загружаем модули дважды
	env.log(`Loading config for module '${modulePath}'...`)
	let configPath = `${modulePath}/config.yaml`;
	let out = parseConfig(configPath);
	let requiredModules = out.requiredModules;
	if (requiredModules) {
		for (let requiredModulePath of Object.keys(requiredModules)) {
			requiredModuleConfig = loadConfig(requiredModulePath);
			objmerge(out, requiredModuleConfig)
		}
	}
	loadedConfigs[modulePath] = out;
	return out;
}

let config = loadConfig('.');
let Engine = getClass('engine');
global.engine = new Engine({ id: 'engine', config });
engine.get('httpServer');
