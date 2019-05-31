const Ssd1351 = require('./oled');
const jimp = require('jimp');
const path = require('path');
const height = 128;
const width = 128;
const hw = height * width;
const ssd1351 = new Ssd1351({height, width, rst: 25, dc: 24});
var pixelsBuffer = Array.from({length: hw * 2}).fill(0);
const getPixelBuffer = async() => {
    let imgName = `screenshot${cc}.png`;
    console.log(imgName);
    let myImage = await jimp.read(path.join('./', imgName));
    await myImage.rgba(false);
    var scanStop = (hw - 1) * 4;
    return new Promise((resolve, reject) => {
        myImage.scan(0, 0, height, width, function(x, y, idx) {
            const bytes = Ssd1351.RGBToRGB565(this.bitmap.data[idx + 0], this.bitmap.data[idx + 1], this.bitmap.data[idx + 2], this.bitmap.data[idx + 3]);
            pixelsBuffer[idx / 2] = bytes[0];
            pixelsBuffer[idx / 2 + 1] = bytes[1];
            if (scanStop === idx) {
                resolve(pixelsBuffer);
            }
        });
    });
};

const waitFor = async(time, fn) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(fn());
        }, time);
    });
};

var cc = 1;

ssd1351.init()
    .then(async(oled) => {
        console.log('deviceDisplayOn');
        await oled.deviceDisplayOn();
        const f = async() => {
            var pb = await getPixelBuffer();
            cc++;
            cc = ((cc > 3) && 1) || cc;
            console.log('deviceSendRaw');
            await oled.deviceSendRaw(pb);
            console.log('deviceContrast');
            await oled.deviceContrast(0);
            Array(255).fill(0).map((v, k) => k).reduce(async(p, c) => {
                await p;
                return waitFor(10, () => oled.deviceContrast(c));
            }, Promise.resolve());
            console.log('done');
        };

        await f();
        return setInterval(async() => f(), 10000);
    })
    .catch(console.error);
