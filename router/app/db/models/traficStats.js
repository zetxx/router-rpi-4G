const Sequelize = require('sequelize');
var table;

module.exports = (sequelize) => (
    table ||
    (table = sequelize.define('trafic.stats', {
        in: Sequelize.INTEGER,
        out: Sequelize.INTEGER,
        initial: Sequelize.BOOLEAN
    })) &&
    table
);
