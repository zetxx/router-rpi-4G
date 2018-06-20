const Sequelize = require('sequelize');
var table;

module.exports = (sequelize) => (
    table ||
    (table = sequelize.define('gsm.status', {
        connected: Sequelize.BOOLEAN,
        network: Sequelize.ENUM('2', '3', '4')
    })) &&
    table
);
