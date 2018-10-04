const Joi = require('joi');
const r = require('rethinkdb');

module.exports = (server, dbInst) => (server.route({
    method: 'GET',
    path: '/lastRecords/{n}',
    config: {
        description: 'get last N records',
        notes: 'get last N records',
        tags: ['api'],
        handler: (request, h) => {
            const orderAndLimit = parseInt(request.params.n);

            return Promise.all([
                r.table('vpn').orderBy('id').limit(orderAndLimit).run(dbInst).then((r) => ({vpn: r})),
                r.table('gsm').orderBy('id').limit(orderAndLimit).run(dbInst).then((r) => ({gsm: r})),,
                r.table('ping').orderBy('id').limit(orderAndLimit).run(dbInst).then((r) => ({ping: r})),,
                r.table('dataUsage').orderBy('id').limit(orderAndLimit).run(dbInst).then((r) => ({dataUsage: r}))
            ])
            .then((r) => r.reduce((a, c) => (Object.assign(a, c)), {}));
        },
        validate: {
            params: {
                n: Joi.number().required().example(10)
            },
            failAction: (request, h, err) => {
                return (err.isJoi && h.response(JSON.stringify(err && err.details)).code(400).takeover()) || h.response(err).takeover();
            }
        }
    }
}));
