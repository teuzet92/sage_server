const express = require("express");
const bodyParser = require("body-parser");
const cors = require('cors');

const port = process.env.PORT ?? 5000;

function accessMaskToRegex(mask) {
	let res = mask.trim().replace('.', '\\.').replace('*', '.*');
	return new RegExp(res);
}

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
		let apiLogStorage = engine.get('apiLogs');
		apiLogStorage.createModel({ values }).save();
	}

	async onHttpRequest(data, response) {
		let out = {
			status: true,
		};
		try {
			var params = data.params ?? {};
			var dwellerId = data.dwellerId;
			let dweller = await engine.getAsync(dwellerId);
			assert(dweller, `Dweller with id '${data.dwellerId}' not found`);
			assert(dweller.config.apiAccess, 'Not an API-adressable dweller');
			var action = params.action ?? dweller.config.defaultApiAction;
			assert(action, `No action specified, and '${data.dwellerId}' has no default action`);
			env.log(dwellerId, action, params)
			let actionConfig = assert(dweller.config.apiActions[action]);
			if (!actionConfig.public) {
				var session = params.session;
				if (session) { // Для отладки
					let actionConfig
					let usersStorage = engine.get('users');
					let user = await usersStorage.getUserBySession(session);
					let accessMasks = user.values.access;
					if (accessMasks) {
						let accessGranted = this.checkAccess(accessMasks, dwellerId, action);
						assert(accessGranted, 'No access');
					}
				} else {
					error('Action is not public. Provide a session token.')
				}
			}
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
			env.log(JSON.stringify(out, null, 2))
			response.json(out);
		}
	}

	checkAccess(accessMasks, dwellerId, action) {
		for (let accessMask of accessMasks) {
			let [ dwellerMask, actionMask ] = accessMask.split(':').map(accessMaskToRegex);
			if (dwellerId.match(dwellerMask) && action.match(actionMask)) {
				return true;
			}
		}
	}
}
