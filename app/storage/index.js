const r = require('rethinkdb');
const log = require('../log');

module.exports = (options) => {
    log.info('storage connect options: ', options);

    return r.connect(options);
};
