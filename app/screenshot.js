const puppeteer = require('puppeteer-core');
const request = require('request-promise-native');
const dimensions = {width: 128, height: 128};
const host = '10.8.0.1:61000';
// const host = '4g-chromium:9222';
request({uri: `http://${host}/json/version`, headers: {host: 'localhost'}, json: true})
    .then((data) => puppeteer.connect({browserWSEndpoint: data.webSocketDebuggerUrl.split('ws://localhost').join(`ws://${host}`), ...dimensions}))
    .then(async(browser) => {
        console.log('browser created');
        const context = await browser.createIncognitoBrowserContext();
        console.log('incognito created');
        const page = await context.newPage();
        console.log('new page');
        try {
            await page.goto('https://bl.ocks.org/interwebjill/raw/8122dd08da9facf8c6ef6676be7da03f/');
            console.log('link opened');
            await page.waitFor(2000);
            console.log('waited ...');
            await page.addStyleTag({content: 'body {margin: 0;padding: 0;}'});
            await page.screenshot({path: './screenshot.png', clip: {x: 0, y: 0, ...dimensions}});
            console.log('screenshoted');
        } catch (e) {
            throw e;
        } finally {
            await context.close();
            console.log('closed');
            await browser.disconnect();
            console.log('disconnected');
        }
        return 1;
    })
    .catch((e) => console.error(e));
