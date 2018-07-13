const Joi = require('joi');
const getGsmStatusModel = require('../../db/models/gsmStatus');
const getVpnStatusModel = require('../../db/models/vpnStatus');
const getPingStatusModel = require('../../db/models/pingStatus');

module.exports = (server, sequelize) => (server.route({
    method: 'GET',
    path: '/lastRecords/{n}',
    config: {
        description: 'get last N records',
        notes: 'get last N records',
        tags: ['api'],
        handler: (request, h) => {
            const orderAndLimit = {order: [['id', 'DESC']], limit: parseInt(request.params.n)};
            return Promise.all([
              getVpnStatus(sequelize).find(orderAndLimit).then((r) => ({vpn: r})),
              getGsmStatsModel(sequelize).find(orderAndLimit).then((r) => ({gsm: r})),
              getPingStatsModel(sequelize).find(orderAndLimit).then((r) => ({ping: r}))
            ])
            .then((r) => r.reduce((a, c) => (Object.assign(a, c)), {}));
        },
        validate: {
            params: {
                n: Joi.number().required().example(10)
            },
            failAction: (request, h, err) => ((err.isJoi && h.response(JSON.stringify(err && err.details)).code(400).takeover()) || h.response(err).takeover())
        }
    }
}));
