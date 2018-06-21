const Sequelize = require('sequelize');
var table;

module.exports = (sequelize) => (
    table ||
    (table = sequelize.define('ping.status', {
        host: Sequelize.STRING,
        time: Sequelize.INTEGER
    })) &&
    table
);
