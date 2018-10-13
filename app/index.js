const log = require('./log');
const config = require('./config')();

config.lcdAddress = parseInt(config.lcdAddress);
if (isNaN(config.lcdAddress)) {
    config.lcdAddress = false;
}

const http = require('./http');
const lcd = require('./lcd');
const db = require('./db');

db(config.storage)
    .then((dbInst) => (
        http(dbInst, config)
        .then(() => config.lcdAddress && lcd(dbInst, config))
    ))
    .then(() => log.info('everything started'))
    .catch(log.error.bind(log));
