const r = require('rethinkdb');
const log = require('../log');

const config = require('rc')('netRouterDbInit', {
    db: {
        host: 'localhost',
        db: 'statuses'
    }
});

module.exports = () => {
    log.info('storage connect options: ', config);

    return r
        .connect(config)
        // create/select db
        .then((conn) => (r
            .dbList()
            .run(conn)
            .then((dbs) => (dbs.indexOf(config.db) === -1 && r.dbCreate(config.db).run(conn)))).then(() => conn)
        )
        // create tables
        .then((conn) =>
            r.tableList().run(conn)
                .then((tables) =>
                    ['gsm', 'ping', 'vpn', 'dataUsage', 'log'].reduce(
                        (p, table) => {
                            if (tables.indexOf(table) === -1) {
                                log.trace(`creating table: ${table}`);
                                return r.tableCreate(table).run(conn)
                                    .then(() => r.table(table).indexCreate('insertTime').run(conn));
                            }
                            return p;
                        },
                        Promise.resolve()
                    )
                    .then(() => conn)
                )
        );
};
