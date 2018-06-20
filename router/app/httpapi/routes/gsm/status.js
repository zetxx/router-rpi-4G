const Joi = require('joi');
const getGsmStatusModel = require('../../../db/models/gsmStatus');

module.exports = (server, sequelize) => (server.route({
    method: 'PUT',
    path: '/gsm/status',
    handler: (request, h) => {
        return getGsmStatusModel()
            .create(request.payload)
            .then(() => request.payload);
    },
    options: {
        validate: {
            payload: {
                connected: Joi.bool().required(),
                network: Joi.any().valid(['0', '2', '3', '4']).required()
            }
        }
    }
}));
