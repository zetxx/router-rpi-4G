/* eslint-disable no-process-env */
/* eslint-disable no-console */
var lcdAddress = parseInt(process.env.LCD_ADDR);
const modemUrl = process.env.MODEM_URL;

if (isNaN(lcdAddress)) {
    lcdAddress = false;
}

const http = require('./http');
const lcd = require('./lcd');
const db = require('./db');
const env = process.env.NODE_ENV || 'dev';

db(env)
    .then((dbInst) => (
        Promise.resolve({dbInst, modemUrl})
            .then(http)
            .then(() => dbInst)
    ))
    .then((dbInst) => (
        Promise.resolve()
            .then(() => lcdAddress && lcd({dbInst, lcdAddress, env}))
            .then(() => dbInst)
    ))
    .catch(console.error);
