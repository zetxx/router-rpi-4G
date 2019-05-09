const isReachable = require('is-reachable');
const pso = require('parse-strings-in-object');
const rc = require('rc');
const Factory = require('bridg-wrong-playground/factory.js');
const Service = Factory({state: true, service: true, api: {type: 'http'}, discovery: {type: 'dns'}, logger: {type: 'udp'}, external: {type: 'dummy'}});

class OnlineChecker extends Service {
    constructor(args) {
        super(args);
        this.setStore(
            ['config', 'onlineChecker'],
            pso(rc(this.getNodeName() || 'buzzer', {
                onlineChecker: {
                    level: 'trace',
                    resetCount: 3,
                    checkInterval: 60000
                }
            }).onlineChecker)
        );
    }

    initCron() {
        let checkInterval = onlineChecker.getStore(['config', 'onlineChecker', 'checkInterval']);
        this.triggerEvent('isReachable', {});
        setInterval(() => this.triggerEvent('isReachable', {}), checkInterval);
    }
}

var onlineChecker = new OnlineChecker({name: 'onlineChecker'});
var onlineStatus = [];

onlineChecker.registerExternalMethod({
    method: 'event.isReachable',
    fn: async function() {
        var io = await isReachable('google.com:80');
        return io;
    }
});

onlineChecker.registerExternalMethod({
    method: 'isReachable.response',
    fn: async function({result, isReachable = result}) {
        let resetCount = onlineChecker.getStore(['config', 'onlineChecker', 'resetCount']);

        if (isReachable) {
            onlineStatus = [];
            onlineChecker.log('info', {internetConnection: 'ok'});
            this.notification('storage.stats.insert', {type: 'is.online', data: {isReachable: true}});
        } else if (onlineStatus.length >= resetCount) {
            onlineChecker.log('warn', {internetConnection: 'down', checks: onlineStatus.length, checkLimit: 'reached'});
            this.notification('storage.stats.insert', {type: 'is.online', data: {isReachable: false}});
            onlineStatus = [];
            try {
                await this.request('modem.command.disconnect');
                return this.request('modem.command.connect');
            } catch (e) {
                onlineChecker.log('error', e);
            }
        } else {
            onlineChecker.log('warn', {internetConnection: 'down', checks: onlineStatus.length + 1});
            onlineStatus.push(Date.now());
        }
        return undefined;
    }
});

onlineChecker.start()
    .then(() => onlineChecker.initCron());
