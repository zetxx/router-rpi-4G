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
            .create({in: request.payload.in, out: request.payload.out, initial})
            .then(() => `traffic [in: ${request.payload.in}, out: ${request.payload.out}]`);
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
