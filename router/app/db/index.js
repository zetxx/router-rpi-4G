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
                            {in: 10, out: 5, initial: true},
                            {in: 12, out: 6, initial: false},
                            {in: 30, out: 8, initial: false},
                            {in: 50, out: 9, initial: false},
                            {in: 1, out: 1, initial: true},
                            {in: 12, out: 6, initial: false},
                            {in: 30, out: 8, initial: false}
                        ])
                    ]));
            }
            return Promise.resolve();
        });
};
