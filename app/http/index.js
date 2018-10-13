const api = require('./api');
const client = require('./client');

module.exports = (dbInst, config) => Promise.resolve()
    .then(() => api(dbInst))
    .then(() => client(dbInst, config));
