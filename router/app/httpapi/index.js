/* eslint-disable no-process-exit */
/* eslint-disable no-console */
'use strict';
const Inert = require('inert');
const Vision = require('vision');
const HapiSwagger = require('hapi-swagger');
const Pack = require('../package');
const Hapi = require('hapi');

module.exports = (sequelize) => {
    const server = Hapi.server({
        port: 3000,
        host: '0.0.0.0'
    });

    require('./routes/main')(server);
    require('./routes/vpn/status')(server, sequelize);
    require('./routes/gsm/status')(server, sequelize);
    require('./routes/ping/status')(server, sequelize);

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
        console.info(`Server running at: ${server.info.uri}`);
    };

    process.on('unhandledRejection', (err) => {
        console.error(err);
        process.exit(1);
    });

    init();
};
