const Sequelize = require('sequelize');
var table;

module.exports = (sequelize) => (
    table ||
    (table = sequelize.define('data.usage', {
        usedTotal: Sequelize.DOUBLE(14, 2)
    })) &&
    table
);
