const puppeteer = require('puppeteer-core');
const request = require('request-promise-native');
const host = '10.8.0.1:61000';
// const host = '4g-chromium:9222';
request({uri: `http://${host}/json/version`, headers: {host: 'localhost'}, json: true})
    .then((data) => puppeteer.connect({browserWSEndpoint: data.webSocketDebuggerUrl.split('ws://localhost').join(`ws://${host}`)}))
    .then(async(browser) => {
        console.log('browser created');
        const context = await browser.createIncognitoBrowserContext();
        console.log('incognito created');
        const page = await context.newPage();
        console.log('new page');
        await page.goto('https://bl.ocks.org/mbostock/4061961');
        console.log('link opened');
        await page.waitFor(5000);
        console.log('waited ...');
        await page.screenshot({path: './screenshot.png', fullPage: true});
        console.log('screenshoted');
        await context.close();
        console.log('closed');
        await browser.disconnect();
        console.log('disconnected');
        return 1;
    })
    .catch((e) => console.error(e));
