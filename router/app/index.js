/* eslint-disable no-process-env */
/* eslint-disable no-console */
const http = require('./httpapi');
const lcd = require('./lcd');
const db = require('./db');

db(process.env.NODE_ENV || 'dev')
    .then((sequelize) => (
        http(sequelize) | // will write everything in sqlite
        lcd(sequelize) // will read everything from sqlite
    ))
    .catch(console.error);

