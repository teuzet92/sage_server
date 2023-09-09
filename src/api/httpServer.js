const express = require("express");
const bodyParser = require("body-parser");
const cors = require('cors');

class HttpServer extends getClass('dweller:Dweller') { 

    async command(data, response) {
        let out = {
            status: true,
        };
        try {
            let dweller = this.core.get(data.dwellerId);
            assert(dweller, `${this.fullId}Dweller with id '${data.dwellerId}' not found!`);
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

    run() {
    	const app = express();
        app.use(bodyParser.urlencoded({ limit: "1mb", extended: true }));
        app.use(bodyParser.json({ limit: "1mb" }));
        app.use(cors());
        this.httpServer = require('http').createServer(app);
        this.app = app;
        let port = this.config.port;
        let urlMask = this.config.urlMask;
        this.app.get(urlMask, (request, response) => {
            let data = {
                dwellerId: request.params['0'],
                params: request.query,
            }
            this.command(data, response);
        });
        this.app.post(urlMask, (request, response) => {
            let data = {
                dwellerId: request.params['0'],
                params: request.body,
            }
            this.command(data, response);
        });
        this.httpServer.listen(port);
    }
}

module.exports = { HttpServer };
