const Ssd1351 = require('ssd1351').Ssd1351;
const jimp = require('jimp');
const path = require('path');
const oled = new Ssd1351(25, 24);
const height = 128;
const width = 128;
const hw = height * width;
var pixelsBuffer = Array.from({length: hw * 2}).fill(0);
const getPixelBuffer = async() => {
    let myImage = await jimp.read(path.join('./', 'screenshot.png'));
    await myImage.rgba(false);
    var scanStop = (hw - 1) * 4;
    return new Promise((resolve, reject) => {
        myImage.scan(0, 0, height, width, function(x, y, idx) {
            const bytes = Ssd1351.convertRgbColourToRgb565(this.bitmap.data[idx + 0], this.bitmap.data[idx + 1], this.bitmap.data[idx + 2], this.bitmap.data[idx + 3]);
            pixelsBuffer[idx / 2] = bytes[0];
            pixelsBuffer[idx / 2 + 1] = bytes[1];
            if (scanStop === idx) {
                resolve(pixelsBuffer);
            }
        });
    });
};

const f = async() => {
    var pb = await getPixelBuffer();
    console .log('turnOnDisplay');
    await oled.turnOnDisplay();
    console .log('setCursor');
    await oled.setCursor(0, 0);
    console .log('setRawData');
    await oled.setRawData(pb);
    console .log('updateScreen');
    await oled.updateScreen();
};

f();
setInterval(async() => await f(), 10000);
