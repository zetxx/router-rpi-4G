const api = require('./api');
const client = require('./client');

module.exports = ({dbInst, modemUrl}) => {
    return Promise.resolve()
        .then(() => api(dbInst))
        .then(() => client({dbInst, modemUrl}));
};
