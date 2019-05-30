const path = require('path');
const Hapi = require('@hapi/hapi');
const pso = require('parse-strings-in-object');
const rc = require('rc');
const Ssd1351 = require('ssd1351').Ssd1351;
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
                    screenshot: {
                        host: '4g-chromium:9222',
                        screenDimensions: {width: 128, height: 128},
                        uri: 'http://bl.ocks.org/interwebjill/raw/8122dd08da9facf8c6ef6676be7da03f/',
                        storeDir: '/app_tmp/'
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
            ['config', 'screenControl', 'screenshot', 'screenDimensions', 'hw'],
            this.getStore(['config', 'screenControl', 'screenshot', 'screenDimensions', 'height']) * this.getStore(['config', 'screenControl', 'screenshot', 'screenDimensions', 'width'])
        );
        this.pixelsBuffer = Array.from({length: this.getStore(['config', 'screenControl', 'screenshot', 'screenDimensions', 'hw']) * 2}).fill(0);
        let {rst, dc} = this.getStore(['config', 'screenControl', 'gpio']);
        this.oled = new Ssd1351(rst, dc);
        await this.httpInit();
        // this.setStore(['config', 'screenControl', 'screenshot', 'uri'], `http://${this.name}:${this.getStore(['config', 'screenControl', 'http', 'port'])}/screen.html`);

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
        let {storeDir, host, uri, screenDimensions: {width, height, hw}} = screenControl.getStore(['config', 'screenControl', 'screenshot']);
        let browserInfo = await request({uri: `http://${host}/json/version`, headers: {host: 'localhost'}, json: true});
        screenControl.log('debug', {in: 'event.pullData', browserInfo});
        let browser = await puppeteer.connect({browserWSEndpoint: browserInfo.webSocketDebuggerUrl.split('ws://localhost').join(`ws://${host}`), width, height});
        screenControl.log('debug', {in: 'event.pullData', browser: {connected: true}});
        const context = await browser.createIncognitoBrowserContext();
        const page = await context.newPage();
        try {
            await page.goto(uri);
            screenControl.log('debug', {in: 'event.pullData', browser: 'url opened'});
            await page.waitFor(2000);
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
                const bytes = Ssd1351.convertRgbColourToRgb565(this.bitmap.data[idx + 0], this.bitmap.data[idx + 1], this.bitmap.data[idx + 2], this.bitmap.data[idx + 3]);
                screenControl.pixelsBuffer[idx / 2] = bytes[0];
                screenControl.pixelsBuffer[idx / 2 + 1] = bytes[1];
                if (scanStop === idx) {
                    resolve(1);
                }
            });
        });
        screenControl.log('debug', {in: 'event.pullData', image: 'constructed'});
        await screenControl.oled.turnOnDisplay();
        await screenControl.oled.clearDisplay();
        await screenControl.oled.setCursor(0, 0);
        await screenControl.oled.setRawData(screenControl.pixelsBuffer);
        await screenControl.oled.updateScreen();
        screenControl.log('debug', {in: 'event.pullData', image: 'send to device'});
        return false;
    }
});

screenControl.registerApiMethod({
    method: 'stats',
    direction: 'in',
    fn: function() {
        return [{date: 1559211018052, upload: 10, download: 90}, {date: 1559212018052, upload: 90, download: 10}, {date: 1559213018052, upload: 10.00, download: 90}];
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
