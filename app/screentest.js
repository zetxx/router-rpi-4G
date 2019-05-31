const Ssd1351 = require('ssd1351').Ssd1351;
const oled = new Ssd1351(25, 24);
const f = async() => {
    await screenControl.oled.turnOnDisplay();
    await screenControl.oled.clearDisplay();
    await screenControl.oled.setCursor(0, 0);
    await screenControl.oled.setRawData(screenControl.pixelsBuffer);
    await screenControl.oled.updateScreen();
};
setInterval(async() => await f(), 10000);
