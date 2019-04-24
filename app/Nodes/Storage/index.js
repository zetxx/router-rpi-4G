const joi = require('joi');
const Factory = require('bridg-wrong-playground/factory.js');
const Storage = Factory({state: true, service: true, api: {type: 'http'}, discovery: {type: 'dns'}, logger: {type: 'udp'}, external: {type: 'storage/postgresql'}});

const throwOrRetrun = function({result, error}) {
    if (error) {
        throw error;
    }
    return result;
};
var storage = new Storage({name: 'storage'});

storage.registerApiMethod({
    method: 'stats.insert',
    direction: 'in',
    fn: function({data, type}) {
        return {insert: {data: `'${JSON.stringify(data)}'`, type: `'${type}'`}, table: 'stats'};
    },
    meta: {
        validate: joi.object({
            type: joi.any().valid(['modem', 'provider', 'is.online', 'vpn']),
            data: joi.object({}).unknown(true)
        })
    }
});
storage.registerExternalMethod({method: 'stats.insert', fn: throwOrRetrun});
storage.registerApiMethod({method: 'stats.insert', direction: 'out', fn: throwOrRetrun});

['modem', 'provider', 'is.online', 'vpn'].map((type) => {
    storage.registerApiMethod({
        method: `get.${type}.stats`,
        direction: 'in',
        fn: function({last}) {
            return {fn: {name: 'getStats', data: [{name: 'type', value: type}, {name: 'last', value: last}]}};
        },
        meta: {
            validate: joi.object({
                last: joi.number().positive().default(5)
            })
        }
    });

    storage.registerExternalMethod({method: `get.${type}.stats`, fn: throwOrRetrun});
    storage.registerApiMethod({method: `get.${type}.stats`, direction: 'out', fn: throwOrRetrun});
});

storage.start();
