const rc = require('rc');
const pso = require('parse-strings-in-object');
const Factory = require('bridg-wrong-playground/factory.js');
const discovery = (pso(rc('', {})).discovery === false && 'direct') || 'mdns';
const Service = Factory({state: true, service: true, api: {type: 'http'}, discovery: {type: discovery}, logger: {type: 'udp'}, external: {type: 'http'}});

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
            ['config', 'netProvider'],
            pso(rc(this.getNodeName() || 'buzzer', {
                netProvider: {
                    level: 'trace',
                    uri: 'http://data.vivacom.bg',
                    triggerEventTimeout: 10800000 // 3 hour
                }
            }).netProvider)
        );
    }

    initCron() {
        let triggerEventTimeout = this.getStore(['config', 'netProvider', 'triggerEventTimeout']);
        this.triggerEvent('traffic', {});
        setInterval(() => this.triggerEvent('traffic', {}), triggerEventTimeout);
    }
}

var service = new NetProvider({name: 'netProvider'});

service.registerExternalMethod({
    method: 'event.traffic',
    fn: function() {
        return {
            uri: service.getStore(['config', 'netProvider', 'uri']),
            headers: {
                'Accept-Encoding': 'gzip'
            },
            gzip: true
        };
    }
});

service.registerExternalMethod({
    method: 'traffic.response',
    fn: function({result}) {
        let trafficUsed = convertToBytes((result.match(/(percentage[^>]+>)([\d,\sa-z.]+)/ig)[1] || '').split('>').pop().trim());
        service.log('info', {trafficUsed});
        this.notification('storage.stats.insert', {type: 'provider', data: {trafficUsed}});
        return undefined;
    }
});

service.start()
    .then(() => service.initCron())
    .catch((e) => service.log('error', {in: 'netProvider.ready', error: e}));
