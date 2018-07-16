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
            var update = {isActive: request.payload.active || false};
            if (!request.payload.active) {
                var tmpStrArr = (request.payload.raw.split('for more info ').pop() || '').split(',').slice(0, -2);
                update.isActive = tmpStrArr.indexOf('CONNECTED') >= 0;
            }
            return getVpnStatusModel()
                .create(update)
                .then(() => 'ok');
        },
        validate: {
            payload: Joi.object().keys({
                active: Joi.bool(),
                raw: Joi.string().min(20)
            }).or('active', 'raw'),
            failAction: (request, h, err) => ((err.isJoi && h.response(JSON.stringify(err && err.details)).code(400).takeover()) || h.response(err).takeover())
        }
    }
}));
