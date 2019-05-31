const path = require('path');
const puppeteer = require('puppeteer-core');
const request = require('request-promise-native');
(async() => {
    let host = '10.8.0.1:61000';
    let width = 128;
    let height = 128;
    let uri = 'http://10.8.0.1:34523/screen.html';
    let browserInfo = await request({uri: `http://${host}/json/version`, headers: {host: 'localhost'}, json: true});
    let browser = await puppeteer.connect({browserWSEndpoint: browserInfo.webSocketDebuggerUrl.split('ws://localhost').join(`ws://${host}`), width, height});
    const context = await browser.createIncognitoBrowserContext();
    const page = await context.newPage();
    try {
        await page.goto(uri);
        await page.waitFor(8000);
        await page.screenshot({path: path.join('/app/', 'screenshot.png'), clip: {x: 0, y: 0, width, height}});
    } catch (e) {
        throw e;
    } finally {
        await context.close();
        await browser.disconnect();
    }
})();