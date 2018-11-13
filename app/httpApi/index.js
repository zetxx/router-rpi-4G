'use strict';
const Inert = require('inert');
const Vision = require('vision');
const HapiSwagger = require('hapi-swagger');
const Hapi = require('hapi');
const Pack = require('../package');
const log = require('../log');
const storage = require('../storage');
const config = require('rc')('netRouterHttpApi', {
    http: {
        port: 3000,
        host: '0.0.0.0'
    },
    db: {
        host: 'localhost',
        db: 'statuses'
    }
});

module.exports = () => {
    const server = Hapi.server(config.http);
    storage(config.db)
        .then((dbInst) => {
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
        });
};
