const oledFont5x7 = require('oled-font-5x7');
var rstGpioId = 22;
var dcGpioId = 18;
const ssd1351 = new (require('ssd1351').Ssd1351)(rstGpioId, dcGpioId);

const test = async() => {
    try {
        await ssd1351.turnOnDisplay();
        ssd1351.clearDisplay();
        ssd1351.setCursor(0, 0);
        await ssd1351.writeString(oledFont5x7, 4, '12:12', { r: 255, g: 255, b: 255 });
        await ssd1351.updateScreen();
        console.log('finished');
    } catch (e) {
        console.error(e);
    }
};

test();
