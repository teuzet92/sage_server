process.chdir('./src/');
const YAML = require('yaml');
const fs = require('fs');

require('./core/util/util');
require('./core/env');

env.projects = {};

global.getClass = function(path) {
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

function createProject(id) {
	let config = { ...env.config };
	let projectConfig = config.projects[id];
	if (typeof projectConfig == 'object') {
		objmerge(config, projectConfig);
	}
	let projectClass = getClass('project');
	let out = new projectClass({ id, config });
	out.project = out;
	env.projects[id] = out;
	return out;
}

env.config = loadConfig('.');
let projects = env.config.projects;
if (projects) {
	for (let projectName of Object.keys(projects)) {
		createProject(projectName);
	}
}




const HttpServer = require('./api/httpServer');
const httpServer = new HttpServer();
