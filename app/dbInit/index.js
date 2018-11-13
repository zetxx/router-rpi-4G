const r = require('rethinkdb');
const log = require('../log');

const config = require('rc')('netRouterDbInit', {
    db: {
        host: 'localhost',
        db: 'statuses'
    }
});

const init = () => {
    log.info('storage connect options: ', config);

    return r
        .connect(config)
        // create/select db
        .then((conn) => (r
            .dbList()
            .run(conn)
            .then((dbs) => (dbs.indexOf(config.db.db) === -1 && r.dbCreate(config.db.db).run(conn)))).then(() => conn)
        )
        // create tables
        .then((conn) => r.db(config.db.db).tableList().run(conn)
        .then((tables) => {
            return ['gsm', 'ping', 'vpn', 'dataUsage', 'log'].reduce(
                (p, table) => {
                    if (tables.indexOf(table) === -1) {
                        log.trace(`creating table: ${table}`);
                        return r.db(config.db.db).tableCreate(table).run(conn)
                            .then(() => r.db(config.db.db).table(table).indexCreate('insertTime').run(conn));
                    }
                    return p;
                },
                Promise.resolve()
            )
            .then(() => conn);
        })
        .catch((e) => log.error(e))
    )
    .then((conn) => {
        conn.close();
    });
};
init();
