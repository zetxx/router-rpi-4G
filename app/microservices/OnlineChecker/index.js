const isReachable = require('is-reachable');
const {getConfig, factory} = require('bridg-wrong-playground/utils');
const discovery = getConfig('', ['resolve'], {}).type || 'mdns';
const Service = factory({state: true, service: true, api: {type: 'http'}, discovery: {type: discovery}, logger: {type: 'udp'}, external: {type: 'dummy'}});

class OnlineChecker extends Service {
    constructor(args) {
        super(args);
        this.setStore(
            ['config', 'onlineChecker'],
            getConfig(this.getNodeName() || 'buzzer', ['onlineChecker'], {
                level: 'trace',
                resetCount: 3,
                checkInterval: 60000
            })
        );
    }

    initCron() {
        let checkInterval = service.getStore(['config', 'onlineChecker', 'checkInterval']);
        this.triggerEvent('isReachable', {});
        setInterval(() => this.triggerEvent('isReachable', {}), checkInterval);
    }
}

var service = new OnlineChecker({name: 'onlineChecker'});
var onlineStatus = [];

service.registerExternalMethod({
    method: 'event.isReachable',
    fn: async function() {
        var io = await isReachable('google.com:80');
        return io;
    }
});

service.registerExternalMethod({
    method: 'isReachable.response',
    fn: async function({result, isReachable = result}) {
        let resetCount = service.getStore(['config', 'onlineChecker', 'resetCount']);

        if (isReachable) {
            onlineStatus = [];
            service.log('info', {internetConnection: 'ok'});
            this.notification('storage.stats.insert', {type: 'is.online', data: {isReachable: true}});
        } else if (onlineStatus.length >= resetCount) {
            service.log('warn', {internetConnection: 'down', checks: onlineStatus.length, checkLimit: 'reached'});
            this.notification('storage.stats.insert', {type: 'is.online', data: {isReachable: false}});
            onlineStatus = [];
            try {
                await this.request('modem.command.disconnect');
                return this.request('modem.command.connect');
            } catch (e) {
                service.log('error', e);
            }
        } else {
            service.log('warn', {internetConnection: 'down', checks: onlineStatus.length + 1});
            onlineStatus.push(Date.now());
        }
        return undefined;
    }
});

service.start()
    .then(() => service.initCron())
    .catch((e) => service.log('error', {in: 'onlineChecker.ready', error: e}));
