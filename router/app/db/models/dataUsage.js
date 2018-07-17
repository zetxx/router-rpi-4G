const Sequelize = require('sequelize');
var table;

module.exports = (sequelize) => (
    table ||
    (table = sequelize.define('data.usage', {
        used: Sequelize.DOUBLE(14, 2)
    })) &&
    table
);
