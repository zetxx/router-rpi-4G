/* eslint-disable no-process-env */
/* eslint-disable no-console */
const http = require('./httpapi');
const lcd = require('./lcd');
const db = require('./db');
if (!process.env.LCD_ADDR) {
    throw new Error('LCD_ADDR env var should be set');
}
var lcdAddress = parseInt(process.env.LCD_ADDR);
if (lcdAddress === 0 || isNaN(lcdAddress)) {
    throw new Error('LCD_ADDR env should contain hex value');
}

db(process.env.NODE_ENV || 'dev')
    .then((sequelize) => (
        Promise.resolve(sequelize)
            .then(http)// will write everything in sqlite
            .then(() => sequelize)
    ))
    .then((sequelize) => (
        Promise.resolve()
            .then(() => lcd(sequelize, process.env.LCD_ADDR)) // will read everything from sqlite
            .then(() => sequelize)
    ))
    .catch(console.error);

