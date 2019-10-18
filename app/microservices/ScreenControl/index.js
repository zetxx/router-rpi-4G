const {parse} = require('url');
const fs = require('fs');
const path = require('path');
const http = require('http');
const jimp = require('jimp');
const puppeteer = require('puppeteer-core');
const request = require('request-promise-native');
const Ssd1351 = require('./lib');
const {getConfig, throwOrReturn, factory} = require('bridg-wrong-playground/utils');
const discovery = getConfig('', ['resolve'], {}).type || 'mdns';
const Service = factory({state: true, service: true, api: {type: 'http'}, discovery: {type: discovery}, logger: {type: 'net'}, external: {type: 'dummy'}});

const getTrafficMetrics = (num) => {
    if (num <= 1024) {
        return `${num}b`;
    } else if ((num / 1024) <= 1024) {
        return `${Math.round(num / 1024)}Kb`;
    } else if ((num / (1024 * 1024)) <= 1024) {
        return `${Math.round(num / (1024 * 1024))}Mb`;
    } else {
        return `${Math.round(num / (1024 * 1024 * 1024))}Gb`;
    }
};

const transformGraphData = (data) => {
    let {maxRx, maxTx, diff} = data.reduce(
        ({maxRx, maxTx, prevRx, prevTx, diff}, {download, upload}, idx) => {
            let diffRx = download - prevRx;
            let diffTx = upload - prevTx;
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
    let rxMetrics = getTrafficMetrics(maxRx);
    let txMetrics = getTrafficMetrics(maxTx);
    let {download, upload} = diff.reduce((a, {download, upload}) => {
        return {download: [...a.download, Math.round(download / maxRxPercent)], upload: [...a.upload, Math.round(upload / maxTxPercent)]};
    }, {download: [], upload: []});
    return [download, upload, rxMetrics, txMetrics];
};

const getTrafficUsedPercentage = (usedTotal, monthlyTraffic) => Math.floor((parseInt(usedTotal) / parseInt(monthlyTraffic)) * 100);

class ScreenControl extends Service {
    constructor(args) {
        super(args);
        this.setStore(
            ['config', 'screenControl'],
            getConfig(this.getNodeName() || 'buzzer', ['screenControl'], {
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
                    port: 34523,
                    host: '0.0.0.0',
                    workDir: path.join(__dirname, 'http')
                }
            })
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
            this.log('debug', {in: 'start', log: 'device init done'});
            await this.oled.deviceDisplayOn(180);
            this.log('debug', {in: 'start', log: 'device display is on'});
        }
        await this.httpInit();

        return super.start()
            .then((d) => ((this.initCron && this.initCron() && d) || d));
    }

    async httpInit() {
        this.frontendServer = http.createServer((req, res) => {
            let {method, url} = req;
            let parsedUrl = parse(url);
            url = parsedUrl.pathname;
            if (method === 'GET' && url.startsWith('/') && !url.endsWith('/')) {
                var resPath = path.join(this.getStore(['config', 'screenControl', 'http', 'workDir']), url);
                if (url.startsWith('/assets/d3/')) {
                    resPath = path.join(path.dirname(require.resolve('d3')), url.split('/assets/d3/').pop());
                }
                if (fs.existsSync(resPath)) {
                    res.writeHead(200);
                    fs.createReadStream(resPath).pipe(res);
                } else {
                    res.writeHead(404);
                    res.end(null);
                }
            } else {
                res.writeHead(404);
                res.end(null);
            }
        });
        return new Promise((resolve, reject) => {
            this.log('debug', {in: 'start', staticServer: this.getStore(['config', 'screenControl', 'http'])});
            this.frontendServer.listen({
                host: this.getStore(['config', 'screenControl', 'http', 'host']),
                port: this.getStore(['config', 'screenControl', 'http', 'port'])
            }, () => resolve(this.getStore(['config', 'screenControl', 'http'])));
        });

        // this.frontendServer.route({
        //     method: 'GET',
        //     path: '/screen.{ext}',
        //     handler: (request, h) => {
        //         return h.file(['screen', request.params.ext].join('.'));
        //     }
        // });
        // this.frontendServer.route({
        //     method: 'GET',
        //     path: '/assets/d3/{params*}',
        //     handler: {
        //         directory: {
        //             path: path.dirname(require.resolve('d3')),
        //             listing: true
        //         }
        //     }
        // });
        // this.frontendServer.route({
        //     method: 'GET',
        //     path: '/icons/{params*}',
        //     handler: {
        //         directory: {
        //             path: path.join(__dirname, 'http/icons'),
        //             listing: true
        //         }
        //     }
        // });
        // this.frontendServer.route({
        //     method: 'GET',
        //     path: '/fonts/{params*}',
        //     handler: {
        //         directory: {
        //             path: path.join(__dirname, 'http/icons'),
        //             listing: true
        //         }
        //     }
        // });
    }

    async stop() {
        clearInterval(this.screenControlCronInterval);
        await this.httpApiServer.close({timeout: 2000});
        return super.stop();
    }

    initCron() {
        let refreshInterval = service.getStore(['config', 'screenControl', 'refreshInterval']);
        this.triggerEvent('pullData', {});
        this.screenControlCronInterval = setInterval(() => this.triggerEvent('pullData', {}), refreshInterval);
    }
}

var service = new ScreenControl({name: 'screenControl'});

service.registerExternalMethod({
    method: 'event.pullData',
    fn: async function() {
        let {rst, dc} = service.getStore(['config', 'screenControl', 'gpio']);
        if (rst && dc) {
            let {width, height, hw} = service.getStore(['config', 'screenControl', 'screenDimensions']);
            let {storeDir, host, uri, loadWait} = service.getStore(['config', 'screenControl', 'screenshot']);
            let browserInfo = await request({uri: `http://${host}/json/version`, headers: {host: 'localhost'}, json: true});
            service.log('debug', {in: 'event.pullData', browserInfo, storeDir, host, uri, width, height, hw, loadWait});
            let browser = await puppeteer.connect({browserWSEndpoint: browserInfo.webSocketDebuggerUrl.split('ws://localhost').join(`ws://${host}`), width, height});
            service.log('debug', {in: 'event.pullData', browser: {connected: true}});
            const context = await browser.createIncognitoBrowserContext();
            const page = await context.newPage();
            try {
                await page.goto(uri);
                service.log('debug', {in: 'event.pullData', browser: 'url opened'});
                await page.waitFor(loadWait);
                await page.screenshot({path: path.join(storeDir, 'screenshot.png'), clip: {x: 0, y: 0, width, height}});
                service.log('debug', {in: 'event.pullData', browser: 'screenshot taken'});
            } catch (e) {
                service.log('error', {in: 'event.pullData', browser: 'error'});
                throw e;
            } finally {
                await context.close();
                await browser.disconnect();
                service.log('debug', {in: 'event.pullData', browser: 'closed and diss'});
            }

            let myImage = await jimp.read(path.join(storeDir, 'screenshot.png'));
            service.log('debug', {in: 'event.pullData', image: 'opened'});
            await myImage.rgba(false);
            var scanStop = (hw - 1) * 4;
            await new Promise((resolve, reject) => {
                myImage.scan(0, 0, height, width, function(x, y, idx) {
                    const bytes = Ssd1351.RGBToRGB565(this.bitmap.data[idx + 0], this.bitmap.data[idx + 1], this.bitmap.data[idx + 2], this.bitmap.data[idx + 3]);
                    service.pixelsBuffer[idx / 2] = bytes[0];
                    service.pixelsBuffer[idx / 2 + 1] = bytes[1];
                    if (scanStop === idx) {
                        resolve(1);
                    }
                });
            });
            service.log('debug', {in: 'event.pullData', image: 'img byte array constructed'});
            await service.oled.deviceSendRaw(service.pixelsBuffer);
            service.log('debug', {in: 'event.pullData', image: 'display ready'});
        }
        return false;
    }
});

service.registerApiMethod({
    method: 'stats',
    direction: 'in',
    fn: async function() {
        let recForGraph = 80;
        let lastModemStats = await this.request('storage.get.modem.stats', {last: 1});
        let modemTraffic = await this.request('storage.get.modem.stats', {last: recForGraph});
        let lastVpnStats = await this.request('storage.get.vpn.stats', {last: 1});
        let lastPingStats = await this.request('storage.get.ping.stats', {last: recForGraph});
        let lastProviderStats = await this.request('storage.get.provider.stats', {last: 1});
        let response = {net: {}, vpn: {}, provider: {}, graphData: [], trafficMetrics: {rx: '0b', tx: '0b'}};
        if (modemTraffic && modemTraffic.length) {
            let t1 = modemTraffic.map(({data: {realtimeTxBytes, realtimeRxBytes}, inserted}) => ({upload: parseInt(realtimeTxBytes), download: parseInt(realtimeRxBytes)})).reverse();
            let [down, up, rxMetrics, txMetrics] = transformGraphData(t1);
            response.trafficMetrics.rx = rxMetrics;
            response.trafficMetrics.tx = txMetrics;
            lastPingStats = lastPingStats.reverse();
            let t2 = down.map((download, idx) => {
                return {download, upload: up[idx], date: idx + 1, ping: parseInt((lastPingStats[idx] && lastPingStats[idx].data && lastPingStats[idx].data.value) || 0)};
            });
            response.graphData = t2;
        }
        if (lastModemStats && lastModemStats.length) {
            let {data: {pppStatus, signalbar}} = lastModemStats.pop();
            response.net.on = pppStatus === 'ppp_connected';
            response.net.bar = parseInt(signalbar);
        }
        if (lastVpnStats && lastVpnStats.length) {
            let {data: {connected}} = lastVpnStats.pop();
            response.vpn.on = connected;
        }
        if (lastProviderStats && lastProviderStats.length) {
            let {data} = lastProviderStats.pop();
            response.provider = {trafficUsed: getTrafficUsedPercentage(data.trafficUsed, service.getStore(['config', 'screenControl', 'monthlyTraffic']))};
        }

        return response;
    },
    meta: {cors: true}
});

service.registerApiMethod({
    method: 'stats',
    direction: 'out',
    fn: throwOrReturn
});

service.registerExternalMethod({
    method: 'stats',
    fn: throwOrReturn
});

service.start()
    .catch((e) => service.log('error', {in: 'screenControl.ready', error: e}));
