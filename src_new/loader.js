process.chdir('./src_new/');
const YAML = require('yaml');
const fs = require('fs');

require('./core/util');
require('./core/env');
const dweller = require('./dweller');
const loadClasses = require('./class');

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

loadClasses(config);

global.engine = Object.create(dweller);
engine.config = config;
engine.engine = engine;
engine.cachedDwellers = {};

engine.get('base');
engine.get('second');
engine.get('base.child');
engine.get('httpServer');


// let httpServerConfig = env.config.httpServer; //TODO: переместить в project.load
// if (httpServerConfig) {
// 	const HttpServer = require('./api/httpServer');
// 	const httpServer = new HttpServer(httpServerConfig);
// }
