const Sequelize = require('sequelize');
var table;

module.exports = (sequelize) => (
    table ||
    (table = sequelize.define('vpn.status', {
        isActive: Sequelize.BOOLEAN
    })) &&
    table
);
