var Dev = require('./oled');
var spidev = new Dev({rst: 25, dc: 24});

const init = async() => {
    await spidev.init();
    await spidev.deviceDisplayOn();
    await spidev.deviceSendRaw(Array(128 * 128 * 2).fill(1));
};

init();
