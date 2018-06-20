const Sequelize = require('sequelize');
const getVpnStatusModel = require('./models/vpnStatus');
const getTrafficStatsModel = require('./models/traficStats');
const getGsmStatsModel = require('./models/gsmStatus');

module.exports = (env) => {
    const isDev = env === 'dev';
    const storage = (!isDev && '/db/db.sqlite') || './db.sqlite';
    const sequelize = new Sequelize({host: 'localhost', dialect: 'sqlite', storage});
    const VpnStatus = getVpnStatusModel(sequelize);
    const TrafficStats = getTrafficStatsModel(sequelize);
    const GsmStats = getGsmStatsModel(sequelize);

    return sequelize.sync()
        .then(() => {
            if (isDev) {
                return Promise.all([
                    // GsmStats.create({connected: true, network: '3'}),
                    VpnStatus.create({isActive: true}),
                    TrafficStats.bulkCreate([
                        {download: 10000, upload: 590, initial: true},
                        {download: 1992, upload: 600, initial: false},
                        {download: 32320, upload: 8, initial: false},
                        {download: 5430, upload: 9009, initial: false},
                        {download: 1663, upload: 1234, initial: true},
                        {download: 1352, upload: 6423, initial: false},
                        {download: 32342340, upload: 8423, initial: false}
                    ])
                ]);
            }
            return true;
        });
};
