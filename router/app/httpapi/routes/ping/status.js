const Joi = require('joi');
const getPingStatusModel = require('../../../db/models/pingStatus');

module.exports = (server, sequelize) => (server.route({
    method: 'PUT',
    path: '/ping/status',
    handler: (request, h) => {
        return getPingStatusModel().create(request.payload)
            .then(() => request.payload);
    },
    options: {
        validate: {
            payload: {
                host: Joi.string().required(),
                time: Joi.string().required()
            }
        }
    }
}));
