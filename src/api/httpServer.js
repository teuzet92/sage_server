const express = require("express");
const bodyParser = require("body-parser");
const cors = require('cors');

const port = process.env.PORT ?? 5000;

module.exports = class extends getClass('dweller') { 

	init(data) {
		const urlMask = assert(this.config.urlMask);
		const app = express();
		app.use(bodyParser.urlencoded({ limit: "1mb", extended: true }));
		app.use(bodyParser.json({ limit: "1mb" }));
		app.use(cors());
		this.httpServer = require('http').createServer(app);
		this.app = app;
		this.app.get(urlMask, (request, response) => {
			let data = {
				dwellerId: request.params['0'],
				params: request.query,
			};
			this.onHttpRequest(data, response);
		});
		this.app.post(urlMask, (request, response) => {
			let data = {
				dwellerId: request.params['0'],
				params: request.body,
			};
			this.onHttpRequest(data, response);
		});
		env.log(`Http server started listening on port ${port}`);
		this.httpServer.listen(port);
	}


	async logRequest(values) {
		let apiLogStorage = await engine.get('apiLogs');
		apiLogStorage.createModel({ values }).save();
	}

	async onHttpRequest(data, response) {
		let out = {
			status: true,
		};
		try {
			var dwellerId = data.dwellerId;
			let dweller = await engine.get(dwellerId);
			var params = data.params ?? {};
			var session = params.session;
			assert(dweller, `Dweller with id '${data.dwellerId}' not found`);
			var action = params.action ?? dweller.config.defaultApiAction;
			assert(action, `No action specified, and '${data.dwellerId}' has no default action`);
			out.data = await dweller.runAction(action, params);
		} catch (error) {
			out.status = false;
			out.error = error.stack;
			env.error('API ERROR\n');
			env.error(data);
			env.error(error);
			if (this.config.logErrors) {
				this.logRequest({
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
