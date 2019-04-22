const rc = require('rc');
const Factory = require('bridg-wrong-playground/factory.js');
const Service = Factory({state: true, service: true, api: {type: 'http'}, discovery: {type: 'dns'}, logger: {type: 'udp'}, external: {type: 'http'}});
const pso = require('parse-strings-in-object');

class NetProvider extends Service {
    constructor(args) {
        super(args);
        this.setStore(
            ['config', 'httpClient'],
            pso(rc(this.getNodeName() || 'buzzer', {
                httpClient: {
                    level: 'trace',
                    uri: 'http://data.vivacom.bg'
                }
            }).httpClient)
        );
    }

    initCron() {
        this.triggerEvent('traffic', {});
        setInterval(() => this.triggerEvent('traffic', {}), (60 * 60 * 1000));
    }
}

var netProvider = new NetProvider({name: 'netProvider'});

netProvider.registerExternalMethod({
    method: 'event.traffic',
    fn: function() {
        return {
            uri: netProvider.getStore(['config', 'httpClient', 'uri']),
            headers: {
                'Accept-Encoding': 'gzip'
            },
            gzip: true
        };
    }
});

netProvider.registerExternalMethod({
    method: 'traffic.response',
    fn: function(response) {
        // console.log(response);
        // do soemthing with the response
        return undefined;
    }
});

netProvider.start()
    .then(() => netProvider.initCron());
