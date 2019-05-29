const pso = require('parse-strings-in-object');
const rc = require('rc');
const Ssd1351 = require('ssd1351').Ssd1351;
const jimp = require('jimp');
const puppeteer = require('puppeteer-core');
const request = require('request-promise-native');
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
                    refreshInterval: 60000,
                    monthlyTraffic: 10485760000,
                    gpio: {rst: 25, dc: 24},
                    screenshot: {
                        host: '4g-chromium:9222',
                        screenDimensions: {width: 128, height: 128},
                        uri: 'https://bl.ocks.org/interwebjill/raw/8122dd08da9facf8c6ef6676be7da03f/'
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
        return super.start()
            .then((d) => ((this.initCron && this.initCron() && d) || d));
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
        let {host, uri, screenDimensions: {width, height, hw}} = this.getStore(['config', 'screenControl', 'screenshot']);
        let browserInfo = await request({uri: `http://${host}/json/version`, headers: {host: 'localhost'}, json: true});
        let browser = await puppeteer.connect({browserWSEndpoint: browserInfo.webSocketDebuggerUrl.split('ws://localhost').join(`ws://${host}`), width, height});
        const context = await browser.createIncognitoBrowserContext();
        const page = await context.newPage();
        try {
            await page.goto(uri);
            await page.waitFor(2000);
            await page.screenshot({path: '/app_tmp/screenshot.png', clip: {x: 0, y: 0, width, height}});
        } catch (e) {
            throw e;
        } finally {
            await context.close();
            await browser.disconnect();
        }

        let myImage = await jimp.read('/app_tmp/screenshot.png');
        await myImage.rgba(false);
        await new Promise((resolve, reject) => {
            myImage.scan(0, 0, height, width, function(x, y, idx) {
                const bytes = Ssd1351.convertRgbColourToRgb565(this.bitmap.data[idx + 0], this.bitmap.data[idx + 1], this.bitmap.data[idx + 2], this.bitmap.data[idx + 3]);
                this.pixelsBuffer[idx / 2] = bytes[0];
                this.pixelsBuffer[idx / 2 + 1] = bytes[1];
                if (hw === (idx / 4)) {
                    resolve(1);
                }
            });
        });
        await this.oled.turnOnDisplay();
        this.oled.clearDisplay();
        this.oled.setCursor(0, 0);
        this.oled.setRawData(this.pixelsBuffer);
        await this.oled.updateScreen();
        return false;
    }
});

screenControl.start();
