const oledFont5x7 = require('oled-font-5x7');
var rstGpioId = 25;
var dcGpioId = 24;
const ssd1351 = new (require('ssd1351').Ssd1351)(rstGpioId, dcGpioId);

const test = async() => {
    try {
        await ssd1351.turnOnDisplay();
        ssd1351.clearDisplay();
        ssd1351.setCursor(0, 0);
        await ssd1351.writeString(oledFont5x7, 2, 'IRI RI', { r: 255, g: 255, b: 255 });
        await ssd1351.updateScreen();
        console.log('finished');
    } catch (e) {
        console.error(e);
    }
};

test();

// ssd1351.clearDisplay();
// ssd1351.setCursor(0, 0);
// ssd1351.writeString(oledFont5x7, 2, 'IRI RI', { r: 255, g: 0, b: 0 });
// ssd1351.setCursor(0, 40);
// ssd1351.writeString(oledFont5x7, 2, 'IRI RI', { r: 0, g: 255, b: 0 });
// ssd1351.setCursor(0, 80);
// ssd1351.writeString(oledFont5x7, 2, 'IRI RI', { r: 0, g: 0, b: 255 });
// ssd1351.updateScreen();
