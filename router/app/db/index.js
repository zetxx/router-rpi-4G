const r = require('rethinkdb');

module.exports = (env) => {
    const isDev = env === 'dev';
    var connOpts = {db: 'statuses'};
    if (!isDev) {
        connOpts.host = '4g-db-rethink';
    }
    return r
        .connect(connOpts)
        // create/select db
        .then((conn) => (r
            .dbList()
            .run(conn)
            .then((dbs) => (dbs.indexOf(connOpts.db) === -1 && r.dbCreate(connOpts.db).run(conn)))).then(() => conn)
        )
        // create tables
        .then((conn) =>
            r.tableList().run(conn)
                .then((tables) =>
                    ['gsm', 'ping', 'vpn', 'dataUsage'].reduce(
                        (p, table) => {
                            if (tables.indexOf(table) === -1) {
                                return r.tableCreate(table).run(conn);
                            }
                            return p;
                        },
                        Promise.resolve()
                    )
                    .then(() => conn)
                )
        )
        .catch((e) => {
            console.error(e);
        });
};
