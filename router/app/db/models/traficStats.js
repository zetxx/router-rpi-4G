const Sequelize = require('sequelize');
var table;

module.exports = (sequelize) => (
    table ||
    (table = sequelize.define('trafic.stats', {
        download: Sequelize.INTEGER,
        upload: Sequelize.INTEGER,
        initial: Sequelize.BOOLEAN
    })) &&
    table
);
