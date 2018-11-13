const Joi = require('joi');
const r = require('rethinkdb');
const log = require('../../log');

const namespaces = ['vpn', 'gsm', 'ping', 'dataUsage'];

module.exports = (server, dbInst) => (server.route({
    method: 'GET',
    path: '/lastRecords/{namespace}/{n}',
    config: {
        description: 'get last N records',
        notes: 'get last N records',
        tags: ['api'],
        handler: (request, h) => {
            const orderAndLimit = parseInt(request.params.n);

            return Promise.all(
                ((request.params.namespace !== 'all' && namespaces.filter((ns) => ns === request.params.namespace)) || namespaces)
                .map((ns) =>
                    r.table(ns).orderBy({index: r.desc('insertTime')}).limit(orderAndLimit).run(dbInst).then((cursor) => cursor.toArray()).then((r) => ({[ns]: r}))
                )
            )
            .then((r) => r.reduce((a, c) => (Object.assign(a, c)), {}))
            .catch((e) => {
                log.error(e);
                throw e;
            });
        },
        validate: {
            params: {
                namespace: Joi.string().allow(['all'].concat(namespaces)).required().example('all'),
                n: Joi.number().required().example(10)
            },
            failAction: (request, h, err) => {
                return (err.isJoi && h.response(JSON.stringify(err && err.details)).code(400).takeover()) || h.response(err).takeover();
            }
        }
    }
}));
