const pino = require('pino')({prettyPrint: {forceColor: true}, level: 'info'});

module.exports = pino;
