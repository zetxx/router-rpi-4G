const {getConfig, throwOrReturn, factory} = require('bridg-wrong-playground/utils');
const discovery = getConfig('', ['resolve'], {}).type || 'mdns';
const Storage = factory({state: true, service: true, api: {type: 'http'}, discovery: {type: discovery}, logger: {type: 'udp'}, external: {type: 'storage/postgresql'}});

var service = new Storage({name: 'storage'});

service.registerApiMethod({
    method: 'stats.insert',
    direction: 'in',
    fn: function({data, type}) {
        if (type === 'vpn') {
            let raw = (Buffer.from(data.raw, 'base64').toString('utf8').split('for more info').pop() || '').split('\n').join('').split(',').slice(0, -1).filter((v) => v);
            return {insert: {data: `'${JSON.stringify({raw, connected: raw.indexOf('CONNECTED') >= 0})}'`, type: `'${type}'`}, table: 'stats'};
        }
        return {insert: {data: `'${JSON.stringify(data)}'`, type: `'${type}'`}, table: 'stats'};
    },
    meta: {
        validate: joi.object({
            type: joi.any().valid(['modem', 'provider', 'is.online', 'vpn', 'ping']),
            data: joi.object({}).unknown(true)
        })
    }
});
service.registerExternalMethod({method: 'stats.insert', fn: throwOrReturn});
service.registerApiMethod({method: 'stats.insert', direction: 'out', fn: throwOrReturn});

['modem', 'provider', 'is.online', 'vpn', 'ping'].map((type) => {
    service.registerApiMethod({
        method: `get.${type}.stats`,
        direction: 'in',
        fn: function({last}) {
            return {fn: {name: 'getStats', data: [{name: 'type', value: type}, {name: 'last', value: last}]}};
        },
        meta: {
            validate: joi.object({
                last: joi.number().positive().example([5])
            })
        }
    });

    service.registerExternalMethod({method: `get.${type}.stats`, fn: throwOrReturn});
    service.registerApiMethod({method: `get.${type}.stats`, direction: 'out', fn: throwOrReturn});
});

service.start()
    .catch((e) => service.log('error', {in: 'storage.ready', error: e}));
