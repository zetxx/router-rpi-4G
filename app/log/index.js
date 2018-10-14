const pino = require('pino')({prettyPrint: {forceColor: true}, level: 'warn'});

module.exports = pino;
