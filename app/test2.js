var Dev = require('./sd.js');
var spidev = new Dev(25, 24);

const init = async() => {
    await spidev.turnOnDisplay();
    spidev.updateScreen();
};

init();
