const Joi = require('joi');
const getVpnStatusModel = require('../../../db/models/vpnStatus');

module.exports = (server, sequelize) => (server.route({
    method: 'PUT',
    path: '/vpn/status',
    handler: (request, h) => {
        return getVpnStatusModel()
            .create({isActive: request.payload.active})
            .then(() => `vpn: active: ${request.payload.active}`);
    },
    options: {
        validate: {
            payload: {
                active: Joi.bool().required()
            }
        }
    }
}));
