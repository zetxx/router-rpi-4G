const path = require('path');
const Hapi = require('@hapi/hapi');
const pso = require('parse-strings-in-object');
const rc = require('rc');
const Ssd1351 = require('../../oled');
const jimp = require('jimp');
const puppeteer = require('puppeteer-core');
const request = require('request-promise-native');
const Factory = require('bridg-wrong-playground/factory.js');
const Service = Factory({state: true, service: true, api: {type: 'http'}, discovery: {type: 'dns'}, logger: {type: 'udp'}, external: {type: 'dummy'}});
const fnThrowOrReturn = function({result, error}) {
    if (error) {
        throw error;
    }
    return result;
};

class ScreenControl extends Service {
    constructor(args) {
        super(args);
        this.setStore(
            ['config', 'screenControl'],
            pso(rc(this.getNodeName() || 'buzzer', {
                screenControl: {
                    level: 'trace',
                    refreshInterval: 60000,
                    monthlyTraffic: 10485760000,
                    gpio: {rst: 25, dc: 24},
                    screenDimensions: {width: 128, height: 128},
                    screenshot: {
                        host: '4g-chromium:9222',
                        uri: 'http://bl.ocks.org/interwebjill/raw/8122dd08da9facf8c6ef6676be7da03f/',
                        storeDir: '/app_tmp/',
                        loadWait: 8000
                    },
                    http: {
                        port: 34523
                    }
                }
            }).screenControl)
        );
    }

    async start() {
        this.setStore(
            ['config', 'screenControl', 'screenDimensions', 'hw'],
            this.getStore(['config', 'screenControl', 'screenDimensions', 'height']) * this.getStore(['config', 'screenControl', 'screenDimensions', 'width'])
        );
        this.pixelsBuffer = Array.from({length: this.getStore(['config', 'screenControl', 'screenDimensions', 'hw']) * 2}).fill(0);
        let {rst, dc} = this.getStore(['config', 'screenControl', 'gpio']);
        let {height, width} = this.getStore(['config', 'screenControl', 'screenDimensions']);
        this.oled = new Ssd1351({height, width, rst, dc});
        if (rst && dc) {
            await this.oled.init();
            screenControl.log('debug', {in: 'start', log: 'device init done'});
            await this.oled.deviceDisplayOn(180);
            screenControl.log('debug', {in: 'start', log: 'device display is on'});
        }
        await this.httpInit();

        return super.start()
            .then((d) => ((this.initCron && this.initCron() && d) || d));
    }

    async httpInit() {
        const server = Hapi.server({
            ...this.getStore(['config', 'screenControl', 'http']),
            routes: {
                files: {
                    relativeTo: path.join(__dirname, 'http')
                }
            }
        });
        await server.register(require('@hapi/inert'));
        server.route({
            method: 'GET',
            path: '/screen.{ext}',
            handler: (request, h) => {
                return h.file(['screen', request.params.ext].join('.'));
            }
        });
        server.route({
            method: 'GET',
            path: '/assets/d3/{params*}',
            handler: {
                directory: {
                    path: path.dirname(require.resolve('d3')),
                    listing: true
                }
            }
        });
        server.route({
            method: 'GET',
            path: '/icons/{params*}',
            handler: {
                directory: {
                    path: path.join(__dirname, 'http/icons'),
                    listing: true
                }
            }
        });
        server.route({
            method: 'GET',
            path: '/fonts/{params*}',
            handler: {
                directory: {
                    path: path.join(__dirname, 'http/icons'),
                    listing: true
                }
            }
        });
        await server.start();
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
        let {rst, dc} = screenControl.getStore(['config', 'screenControl', 'gpio']);
        if (rst && dc) {
            let {width, height, hw} = screenControl.getStore(['config', 'screenControl', 'screenDimensions']);
            let {storeDir, host, uri, loadWait} = screenControl.getStore(['config', 'screenControl', 'screenshot']);
            let browserInfo = await request({uri: `http://${host}/json/version`, headers: {host: 'localhost'}, json: true});
            screenControl.log('debug', {in: 'event.pullData', browserInfo, storeDir, host, uri, width, height, hw, loadWait});
            let browser = await puppeteer.connect({browserWSEndpoint: browserInfo.webSocketDebuggerUrl.split('ws://localhost').join(`ws://${host}`), width, height});
            screenControl.log('debug', {in: 'event.pullData', browser: {connected: true}});
            const context = await browser.createIncognitoBrowserContext();
            const page = await context.newPage();
            try {
                await page.goto(uri);
                screenControl.log('debug', {in: 'event.pullData', browser: 'url opened'});
                await page.waitFor(loadWait);
                await page.screenshot({path: path.join(storeDir, 'screenshot.png'), clip: {x: 0, y: 0, width, height}});
                screenControl.log('debug', {in: 'event.pullData', browser: 'screenshot taken'});
            } catch (e) {
                screenControl.log('error', {in: 'event.pullData', browser: 'error'});
                throw e;
            } finally {
                await context.close();
                await browser.disconnect();
                screenControl.log('debug', {in: 'event.pullData', browser: 'closed and diss'});
            }

            let myImage = await jimp.read(path.join(storeDir, 'screenshot.png'));
            screenControl.log('debug', {in: 'event.pullData', image: 'opened'});
            await myImage.rgba(false);
            var scanStop = (hw - 1) * 4;
            await new Promise((resolve, reject) => {
                myImage.scan(0, 0, height, width, function(x, y, idx) {
                    const bytes = Ssd1351.RGBToRGB565(this.bitmap.data[idx + 0], this.bitmap.data[idx + 1], this.bitmap.data[idx + 2], this.bitmap.data[idx + 3]);
                    screenControl.pixelsBuffer[idx / 2] = bytes[0];
                    screenControl.pixelsBuffer[idx / 2 + 1] = bytes[1];
                    if (scanStop === idx) {
                        resolve(1);
                    }
                });
            });
            screenControl.log('debug', {in: 'event.pullData', image: 'img byte array constructed'});
            await screenControl.oled.deviceSendRaw(screenControl.pixelsBuffer);
            screenControl.log('debug', {in: 'event.pullData', image: 'display ready'});
        }
        return false;
    }
});

const transformGraphData = (data) => {
    let {maxRx, maxTx, diff} = data.reduce(
        ({maxRx, maxTx, prevRx, prevTx, diff}, {download, upload}, idx) => {
            let diffRx = prevRx - download;
            let diffTx = prevTx - upload;
            return {
                diff: (idx && diff.concat([{download: diffRx, upload: diffTx}])) || [],
                prevRx: download,
                prevTx: upload,
                maxRx: idx && ((diffRx > maxRx && diffRx) || maxRx),
                maxTx: idx && ((diffTx > maxTx && diffTx) || maxTx)
            };
        },
        {diff: [], prevRx: 0, prevTx: 0, maxRx: 0, maxTx: 0}
    );
    let maxRxPercent = maxRx / 100;
    let maxTxPercent = maxTx / 100;
    let {download, upload} = diff.reduce((a, {download, upload}) => {
        return {download: [...a.download, Math.round(download / maxRxPercent)], upload: [...a.upload, Math.round(upload / maxTxPercent)]};
    }, {download: [], upload: []});
    return [download, upload];
};

screenControl.registerApiMethod({
    method: 'stats',
    direction: 'in',
    fn: async function() {
        let lastModemStats = await this.request('storage.get.modem.stats', {last: 1});
        let modemTraffic = (await this.request('storage.get.modem.stats', {last: 70}));
        let lastVpnStats = await this.request('storage.get.vpn.stats', {last: 1});
        let lastPingStats = await this.request('storage.get.ping.stats', {last: 1});
        let lastProviderStats = await this.request('storage.get.provider.stats', {last: 1});
        let response = {net: {}, vpn: {}, ping: {}, provider: {}, traffic: []};
        if (modemTraffic && modemTraffic.length) {
            let t1 = modemTraffic.map(({data: {realtime_tx_bytes, realtime_rx_bytes}, inserted}) => ({upload: parseInt(realtime_tx_bytes), download: parseInt(realtime_rx_bytes)}));
            let [down, up] = transformGraphData(t1);
            let t2 = down.map((download, idx) => {
                return {download, upload: up[idx], date: idx + 1};
            });
            response.traffic = t2;
            // response.traffic = [{date: 1559211018052, upload: 10, download: 90}, {date: 1559212018052, upload: 90, download: 10}, {date: 1559213018052, upload: 10.00, download: 90}];
        }
        if (lastModemStats && lastModemStats.length) {
            let {data: {ppp_status, signalbar}} = lastModemStats.pop();
            response.net.on = ppp_status === 'ppp_connected';
            response.net.bar = parseInt(signalbar);
        }
        if (lastVpnStats && lastVpnStats.length) {
            let {data: {connected}} = lastVpnStats.pop();
            response.vpn.on = connected;
        }
        if (lastPingStats && lastPingStats.length) {
            let {data: {host, value}} = lastPingStats.pop();
            response.ping = {host, value};
        }
        if (lastProviderStats && lastProviderStats.length) {
            let {data} = lastProviderStats.pop();
            response.provider = data;
        }

        return response;
    },
    meta: {cors: true}
});

screenControl.registerApiMethod({
    method: 'stats',
    direction: 'out',
    fn: fnThrowOrReturn
});

screenControl.registerExternalMethod({
    method: 'stats',
    fn: fnThrowOrReturn
});

screenControl.start();
