const Sequelize = require('sequelize');
const getVpnStatusModel = require('./models/vpnStatus');
const getGsmStatsModel = require('./models/gsmStatus');
const getPingStatsModel = require('./models/pingStatus');
const getDataUsageModel = require('./models/dataUsage');

module.exports = (env) => {
    const isDev = env === 'dev';
    const storage = (!isDev && '/db/db.sqlite') || './db.sqlite';
    const sequelize = new Sequelize({host: 'localhost', dialect: 'sqlite', storage});
    getVpnStatusModel(sequelize);
    getGsmStatsModel(sequelize);
    getPingStatsModel(sequelize);
    getDataUsageModel(sequelize);

    return sequelize.sync();
};
