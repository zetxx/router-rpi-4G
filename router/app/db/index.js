const Sequelize = require('sequelize');
const getVpnStatusModel = require('./models/vpnStatus');
const getTrafficStatsModel = require('./models/traficStats');
const getGsmStatsModel = require('./models/gsmStatus');
const getPingStatsModel = require('./models/pingStatus');

module.exports = (env) => {
    const isDev = env === 'dev';
    const storage = (!isDev && '/db/db.sqlite') || './db.sqlite';
    const sequelize = new Sequelize({host: 'localhost', dialect: 'sqlite', storage});
    getVpnStatusModel(sequelize);
    getTrafficStatsModel(sequelize);
    getGsmStatsModel(sequelize);
    getPingStatsModel(sequelize);

    return sequelize.sync();
};
