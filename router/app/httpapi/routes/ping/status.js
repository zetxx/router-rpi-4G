const Joi = require('joi');
const getPingStatusModel = require('../../../db/models/pingStatus');

module.exports = (server, sequelize) => (server.route({
    method: 'PUT',
    path: '/ping/status',
    config: {
        description: 'populate ping times',
        notes: 'populate ping times',
        tags: ['api'],
        handler: (request, h) => {
            return getPingStatusModel()
                .create(request.payload)
                .then(() => 'ok');
        },
        validate: {
            payload: Joi.object({
                host: Joi.string().required(),
                time: Joi.string().required()
            }),
            failAction: (request, h, err) => ((err.isJoi && h.response(JSON.stringify(err && err.details)).code(400).takeover()) || h.response(err).takeover())
        }
    }
}));
