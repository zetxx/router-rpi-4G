/* eslint-disable no-process-env */
/* eslint-disable no-console */
if (!process.env.LCD_ADDR) {
    throw new Error('LCD_ADDR env var should be set');
}
var lcdAddress = parseInt(process.env.LCD_ADDR);
if (isNaN(lcdAddress)) {
    throw new Error('LCD_ADDR env should contain hex value');
}

const http = require('./httpapi');
const lcd = require('./lcd');
const db = require('./db');
const env = process.env.NODE_ENV || 'dev';
const disableLcd = (process.env.DISABLE_LCD && true) || false;

db(env)
    .then((dbInst) => (
        Promise.resolve(dbInst)
            .then(http) // will write everything in sqlite
            .then(() => dbInst)
    ))
    .then((dbInst) => (
        Promise.resolve()
            .then(() => lcd(dbInst, lcdAddress, env, disableLcd)) // will read everything from sqlite
            .then(() => dbInst)
    ))
    .catch(console.error);
