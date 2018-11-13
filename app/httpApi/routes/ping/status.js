const Joi = require('joi');
const r = require('rethinkdb');
const log = require('../../../log');

module.exports = (server, dbInst) => (server.route({
    method: 'PUT',
    path: '/ping/status',
    config: {
        description: 'populate ping times',
        notes: 'populate ping times',
        tags: ['api'],
        handler: (request, h) => (r
            .table('ping')
            .insert(Object.assign({insertTime: Date.now()}, request.payload))
            .run(dbInst)
            .catch((e) => {
                log.error(e);
                throw e;
            })
        ),
        validate: {
            payload: Joi.object({
                host: Joi.string().required(),
                time: Joi.string().required()
            }),
            failAction: (request, h, err) => ((err.isJoi && h.response(JSON.stringify(err && err.details)).code(400).takeover()) || h.response(err).takeover())
        }
    }
}));
