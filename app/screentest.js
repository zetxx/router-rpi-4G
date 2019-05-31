const Ssd1351 = require('./oled');
const jimp = require('jimp');
const path = require('path');
const height = 128;
const width = 128;
const hw = height * width;
const ssd1351 = new Ssd1351({height, width, rst: 25, dc: 24});
var pixelsBuffer = Array.from({length: hw * 2}).fill(0);
const getPixelBuffer = async() => {
    let myImage = await jimp.read(path.join('./', 'screenshot.png'));
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

ssd1351.init()
    .then((oled) => {
        const f = async() => {
            var pb = await getPixelBuffer();
            console.log('deviceDisplayOn');
            await oled.deviceDisplayOn();
            console.log('deviceSendRaw');
            await oled.deviceSendRaw(pb);
            console.log('done');
        };

        f();
        return setInterval(async() => f(), 10000);
    })
    .catch(console.error);
