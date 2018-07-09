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
                .then(() => `vpn: active: ${request.payload.active}`);
        },
        validate: {
            payload: {
                active: Joi.bool().required()
            }
        }
    }
}));
