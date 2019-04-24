const pso = require('parse-strings-in-object');
const rc = require('rc');
const Factory = require('bridg-wrong-playground/factory.js');
const Service = Factory({state: true, service: true, api: {type: 'http'}, discovery: {type: 'dns'}, logger: {type: 'udp'}, external: {type: 'dummy'}});

class ScreenControl extends Service {
    constructor(args) {
        super(args);
        this.setStore(
            ['config', 'screenControl'],
            pso(rc(this.getNodeName() || 'buzzer', {
                screenControl: {
                    level: 'trace',
                    refreshInterval: 60000
                }
            }).screenControl)
        );
    }

    initCron() {
        let refreshInterval = screenControl.getStore(['config', 'screenControl', 'refreshInterval']);
        this.triggerEvent('pullData', {});
        setInterval(() => this.triggerEvent('pullData', {}), refreshInterval);
    }
}

var screenControl = new ScreenControl({name: 'screenControl'});

screenControl.registerExternalMethod({
    method: 'event.pullData',
    fn: async function() {
        return {
            isOnline: (await this.request('storage.get.is.online.stats')),
            modem: (await this.request('storage.get.modem.stats')),
            ping: (await this.request('storage.get.ping.stats')),
            vpn: (await this.request('storage.get.vpn.stats')),
            provider: (await this.request('storage.get.provider.stats'))
        };
    }
});

screenControl.registerExternalMethod({
    method: 'pullData.response',
    fn: async function({result, error}) {
        return undefined;
    }
});

screenControl.start()
    .then(() => screenControl.initCron());
