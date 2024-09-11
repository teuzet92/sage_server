require("dotenv").config({ path: "../.env" });
const env = {};

env.time = function () {
	return Date.now();
}

env.log = function(...args) {
	console.log(...args);
}

env.warn = function(...args) {
	console.warn(...args);
}

env.error = function(...args) {
	console.error(...args);
}

global.env = env;
