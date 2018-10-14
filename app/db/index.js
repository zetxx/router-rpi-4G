const r = require('rethinkdb');
const log = require('../log');

module.exports = (options) => {
    log.trace('storage connect options: ', options);

    return r
        .connect(options)
        // create/select db
        .then((conn) => (r
            .dbList()
            .run(conn)
            .then((dbs) => (dbs.indexOf(options.db) === -1 && r.dbCreate(options.db).run(conn)))).then(() => conn)
        )
        // create tables
        .then((conn) =>
            r.tableList().run(conn)
                .then((tables) =>
                    ['gsm', 'ping', 'vpn', 'dataUsage', 'log'].reduce(
                        (p, table) => {
                            if (tables.indexOf(table) === -1) {
                                log.trace(`creating table: ${table}`);
                                return r.tableCreate(table).run(conn);
                            }
                            return p;
                        },
                        Promise.resolve()
                    )
                    .then(() => conn)
                )
        );
};
