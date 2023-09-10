const express = require("express");
const bodyParser = require("body-parser");
const cors = require('cors');

const port = process.env.PORT ?? 5000;
const urlMask = process.env.API_URL_MASK ?? '/*/api/*';

module.exports = class HttpServer { 

    constructor() {
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
            this.command(data, response);
        });
        this.app.post(urlMask, (request, response) => {
            let data = {
                projectId: request.params['0'],
                dwellerId: request.params['1'],
                params: request.body,
            }
            this.command(data, response);
        });
        this.httpServer.listen(port);
    }

    async command(data, response) {
        let out = {
            status: true,
        };
        try {
            let project = assert(env.projects[data.projectId], `Project '${data.projectId}' not found`);
            let dweller = project.get(data.dwellerId);
            assert(dweller, `${this.fullId}Dweller with id '${data.dwellerId}' not found`);
            let params = dweller.parseParams(data.params);
            out.data = await dweller.run(params);
        } catch (error) {
            out.status = false;
            out.error = error.message;
            env.error(error);
        } finally {
            response.json(out);
        }
    }
}
