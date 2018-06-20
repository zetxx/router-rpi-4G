const Joi = require('joi');
const getTrafficStatsModel = require('../../../db/models/traficStats');

var init = true;

module.exports = (server, sequelize) => (server.route({
    method: 'PUT',
    path: '/traffic/stats',
    handler: (request) => {
        const initial = init;
        init = false;
        return getTrafficStatsModel()
            .create({download: request.payload.in, upload: request.payload.out, initial})
            .then(() => `traffic [download: ${request.payload.in}, upload: ${request.payload.out}]`);
    },
    options: {
        validate: {
            payload: {
                in: Joi.number().required(),
                out: Joi.number().required()
            }
        }
    }
}));
