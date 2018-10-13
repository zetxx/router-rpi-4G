'use strict';
const Inert = require('inert');
const Vision = require('vision');
const HapiSwagger = require('hapi-swagger');
const Hapi = require('hapi');
const Pack = require('../../package');
const log = require('../../log');

module.exports = (dbInst) => {
    const server = Hapi.server({
        port: 3000,
        host: '0.0.0.0'
    });

    require('./routes/main')(server);
    require('./routes/lastRecords')(server, dbInst);
    require('./routes/vpn/status')(server, dbInst);
    require('./routes/ping/status')(server, dbInst);

    const init = async () => {
        await server.register([
            Inert,
            Vision,
            {
                plugin: HapiSwagger,
                options: {
                    info: {
                        title: 'Test API Documentation',
                        version: Pack.version
                    }
                }
            }
        ]);
        await server.start();
        log.info(`Http Api Server running at: ${server.info.uri}`);
    };
    init();
};
