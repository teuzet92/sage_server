const express = require("express");
const bodyParser = require("body-parser");
const cors = require('cors');

const port = process.env.PORT ?? 5000;

module.exports = class HttpServer { 
	constructor(config) {
		this.config = config;
		const urlMask = assert(config.urlMask);
		const app = express();
		app.use(bodyParser.urlencoded({ limit: "1mb", extended: true }));
		app.use(bodyParser.json({ limit: "1mb" }));
		app.use(cors());
		this.httpServer = require('http').createServer(app);
		this.app = app;
		this.app.get(urlMask, (request, response) => {
			let data = {
				projectId: request.params['0'],
				dwellerId: request.params['1'],
				params: request.query,
			}
			this.onHttpRequest(data, response);
		});
		this.app.post(urlMask, (request, response) => {
			let data = {
				projectId: request.params['0'],
				dwellerId: request.params['1'],
				params: request.body,
			}
			this.onHttpRequest(data, response);
		});
		this.httpServer.listen(port);
	}

	async logRequest(project, values) {
		let apiLogStorage = await project.get('apiLogs');
		apiLogStorage.createModel({ values }).save();
	}

	async onHttpRequest(data, response) {
		// let projectLogs = await this.project.get('Project logs')
		let out = {
			status: true,
		};
		try {
			var project = assert(env.projects[data.projectId], `Project '${data.projectId}' not found`);
			var dwellerId = data.dwellerId;
			let dweller = await project.get(dwellerId);
			var params = data.params ?? {};
			var session = params.session;
			assert(dweller, `Dweller with id '${data.dwellerId}' not found`);
			var action = params.action ?? dweller.config.defaultApiAction;
			assert(action, `No action specified, and '${data.dwellerId}' has no default action`);
			out.data = await dweller.runAction(action, params);
		} catch (error) {
			out.status = false;
			out.error = error.message;
			env.error('API ERROR\n');
			env.error(data);
			env.error(error);
			if (this.config.logErrors) {
				this.logRequest(project, {
					source: 'api',
					level: 'error',
					dwellerId,
					action,
					session,
					params,
					response: out,
				});
			}
		} finally {
			response.json(out);
		}
	}
}
