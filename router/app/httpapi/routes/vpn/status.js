const Joi = require('joi');
const getVpnStatusModel = require('../../../db/models/vpnStatus');

module.exports = (server, sequelize) => (server.route({
    method: 'PUT',
    path: '/vpn/status',
    config: {
        description: 'populate vpn status',
        notes: 'populate vpn status',
        tags: ['api'],
        handler: (request, h) => {
            return getVpnStatusModel()
                .create({isActive: request.payload.active})
                .then(() => 'ok');
        },
        validate: {
            payload: {
                active: Joi.bool().required()
            },
            failAction: (request, h, err) => ((err.isJoi && h.response(JSON.stringify(err && err.details)).code(400).takeover()) || h.response(err).takeover())
        }
    }
}));
