const joi = require('joi');
const Factory = require('bridg-wrong-playground/factory.js');
const Storage = Factory({state: true, service: true, api: {type: 'http'}, discovery: {type: 'dns'}, logger: {type: 'udp'}, external: {type: 'storage/postgresql'}});

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

storage.registerExternalMethod({
    method: 'stats.insert',
    fn: function({result, error}) {
        if (error) {
            throw error;
        }
        return result;
    }
});

storage.registerApiMethod({
    method: 'stats.insert',
    direction: 'out',
    fn: function(message) {
        return message;
    }
});

storage.start();
