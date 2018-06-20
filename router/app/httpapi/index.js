/* eslint-disable no-process-exit */
/* eslint-disable no-console */
'use strict';
const Hapi = require('hapi');

module.exports = (sequelize) => {
    const server = Hapi.server({
        port: 3000,
        host: 'localhost'
    });

    require('./routes/main')(server);
    require('./routes/traffic/stats')(server, sequelize);
    require('./routes/vpn/status')(server, sequelize);
    require('./routes/gsm/status')(server, sequelize);

    const init = async () => {
        await server.start();
        console.info(`Server running at: ${server.info.uri}`);
    };

    process.on('unhandledRejection', (err) => {
        console.error(err);
        process.exit(1);
    });

    init();
};
