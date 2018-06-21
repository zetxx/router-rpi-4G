/* eslint-disable no-process-env */
/* eslint-disable no-console */
const http = require('./httpapi');
const lcd = require('./lcd');
const db = require('./db');
if (!process.env.LCD_ADDR) {
    throw new Error('LCD_ADDR env var should be set');
}

db(process.env.NODE_ENV || 'dev')
    .then((sequelize) => (
        http(sequelize) | // will write everything in sqlite
        lcd(sequelize, process.env.LCD_ADDR) // will read everything from sqlite
    ))
    .catch(console.error);

