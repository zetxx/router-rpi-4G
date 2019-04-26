const pso = require('parse-strings-in-object');
const rc = require('rc');
const Factory = require('bridg-wrong-playground/factory.js');
const oled = require('./oled');
const Service = Factory({state: true, service: true, api: {type: 'http'}, discovery: {type: 'dns'}, logger: {type: 'udp'}, external: {type: 'dummy'}});

class ScreenControl extends Service {
    constructor(args) {
        super(args);
        this.setStore(
            ['config', 'screenControl'],
            pso(rc(this.getNodeName() || 'buzzer', {
                screenControl: {
                    level: 'trace',
                    refreshInterval: 60000,
                    hwAddr: 0,
                    width: 128,
                    height: 64,
                    monthlyTraffic: 10485760000
                }
            }).screenControl)
        );
    }

    async start() {
        this.draw = await oled({
            hwAddr: this.getStore(['config', 'screenControl', 'hwAddr']),
            width: this.getStore(['config', 'screenControl', 'width']),
            height: this.getStore(['config', 'screenControl', 'height'])
        });
        return super.start();
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
            isOnline: (await this.request('storage.get.is.online.stats', {last: 1})).pop() || {},
            modem: (await this.request('storage.get.modem.stats', {last: 1})).pop() || {},
            graphData: ((await this.request('storage.get.modem.stats', {last: 126})) || [])
                .reverse().map(({data: {realtime_tx_bytes, realtime_rx_bytes}} = {}) => ({
                    realtimeTxBytes: realtime_tx_bytes,
                    realtimeRxBytes: realtime_rx_bytes
                })),
            ping: (await this.request('storage.get.ping.stats', {last: 1})).pop() || {},
            vpn: (await this.request('storage.get.vpn.stats', {last: 1})).pop() || {},
            provider: (await this.request('storage.get.provider.stats', {last: 1})).pop() || {}
        };
    }
});

screenControl.registerExternalMethod({
    method: 'pullData.response',
    fn: async function({result, error}) {
        let monthlyTraffic = screenControl.getStore(['config', 'screenControl', 'monthlyTraffic']);
        if (!screenControl.getStore(['config', 'screenControl', 'hwAddr'])) {
            if (result) {
                let asciiArt = await screenControl.draw(result, monthlyTraffic);
                console.log(asciiArt);
                screenControl.log('info', {asciiArt: asciiArt});
            }
        } else {
            result && screenControl.draw(result, monthlyTraffic);
        }
        return undefined;
    }
});

screenControl.start()
    .then(() => screenControl.initCron());
