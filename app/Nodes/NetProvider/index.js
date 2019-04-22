const rc = require('rc');
const Factory = require('bridg-wrong-playground/factory.js');
const Service = Factory({state: true, service: true, api: {type: 'http'}, discovery: {type: 'dns'}, logger: {type: 'udp'}, external: {type: 'http'}});
const pso = require('parse-strings-in-object');

const dataTypeList = ['b', 'kb', 'mb', 'gb', 'tb'];

const convertToBytes = (content) => {
    var arr = content.toLowerCase().split(',').join('').split(' ') || [];
    var dataUsedRaw = arr.shift();
    var dataType = dataTypeList.indexOf(arr.pop());
    var dataUsed = 0;
    if (dataType >= 0) {
        dataUsed = ((!isNaN(parseFloat(dataUsedRaw)) && parseFloat(dataUsedRaw)) || 0) * Math.pow(1024, dataType);
    }
    return dataUsed;
};

class NetProvider extends Service {
    constructor(args) {
        super(args);
        this.setStore(
            ['config', 'httpClient'],
            pso(rc(this.getNodeName() || 'buzzer', {
                httpClient: {
                    level: 'trace',
                    uri: 'http://data.vivacom.bg',
                    triggerEventTimeout: 3600000 // 1 hour
                }
            }).httpClient)
        );
    }

    initCron() {
        let triggerEventTimeout = this.getStore(['config', 'httpClient', 'triggerEventTimeout']);
        this.triggerEvent('traffic', {});
        setInterval(() => this.triggerEvent('traffic', {}), triggerEventTimeout);
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
        let trafficUsed = convertToBytes((response.match(/(percentage[^>]+>)([\d,\sa-z.]+)/ig)[1] || '').split('>').pop().trim());
        netProvider.log('info', {trafficUsed});
        // do soemthing with the response
        return undefined;
    }
});

netProvider.start()
    .then(() => netProvider.initCron());
