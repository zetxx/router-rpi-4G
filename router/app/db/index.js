const Sequelize = require('sequelize');
const getVpnStatusModel = require('./models/vpnStatus');
const getTrafficStatsModel = require('./models/traficStats');

module.exports = (env) => {
    const isDev = env === 'dev';
    const storage = (!isDev && '/db/db.sqlite') || './db.sqlite';
    const sequelize = new Sequelize({host: 'localhost', dialect: 'sqlite', storage});
    const VpnStatus = getVpnStatusModel(sequelize);
    const TrafficStats = getTrafficStatsModel(sequelize);

    return sequelize.sync()
        .then(() => {
            if (isDev) {
                return VpnStatus
                    .findAll()
                    .then((r) => !r.length && Promise.all([
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
                    ]));
            }
            return Promise.resolve();
        });
};
