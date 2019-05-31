const Gpio = require('onoff').Gpio;
const spiDev = require('spi-device');

async function command(oled, dcGpio, dataCommand, data) {
    dcGpio.writeSync(0);
    await sendBytes(oled, [dataCommand]);
    dcGpio.writeSync(1);
    if (0 === data.length) {
        return;
    }

    for (let i = 0; i < data.length; i = i + 4096) {
        {
            const dataToSend = Buffer.from(data.slice(i, i + 4096))
            await sendBytes(oled, dataToSend);
        }
    }
}

async function sendBytes(oled, bytes) {
    return new Promise((resolve, reject) => {
        const message = [{
            sendBuffer: Buffer.from(bytes),
            byteLength: bytes.length
        }];

        oled.transfer(message, (err, message) => {
            if (err) {
                console.error(err);
                reject(err);
                return;
            }
            resolve();
        });
    });
}

async function updateScreen(oled, dcGpio) {
    await command(oled, dcGpio, 0x15, [0, 127]);
    await command(oled, dcGpio, 0x75, [0, 127]);
    await command(oled, dcGpio, 0x5C, Array(128 * 128 * 2).fill(1));
}

const init = async() => {
    let rstGpio = new Gpio(25, 'out');
    let dcGpio = new Gpio(24, 'out');
    let spi = await new Promise((resolve, reject) => {
        let s = spiDev.open(0, 0, {
            maxSpeedHz: 19660800
        }, (err) => {
            if (err) {
                console.error(err);
                reject(err);
            } else {
                console.info('oled initialized');
                resolve(s);
            }
        });
    });

    rstGpio.writeSync(0);
    rstGpio.writeSync(1);

    await command(spi, dcGpio, 0xFD, [0x12]);
    //  await command A2,B1,B3,BB,BE,C1 accessible if in unlock state
    await command(spi, dcGpio, 0xFD, [0xB1]);
    // Display off
    await command(spi, dcGpio, 0xAE, []);
    //  Clock divider
    await command(spi, dcGpio, 0xB3, [0xF1]);
    //  Mux ratio
    await command(spi, dcGpio, 0xCA, [0x7F]);
    //  Set column address
    await command(spi, dcGpio, 0x15, [0x00, 0x7F]);
    //  Set row address
    await command(spi, dcGpio, 0x75, [0x00, 0x7F]);
    //  Segment remapping - Column address remapping or else everything is mirrored
    await command(spi, dcGpio, 0xA0, [0x74]);
    //  Set Display start line
    await command(spi, dcGpio, 0xA1, [0x00]);
    //  Set display offset
    await command(spi, dcGpio, 0xA2, [0x00]);
    //  Set GPIO
    await command(spi, dcGpio, 0xB5, [0x00]);
    // Function select (internal - diode drop)
    await command(spi, dcGpio, 0xAB, [0x01]);
    // Precharge
    await command(spi, dcGpio, 0xB1, [0x32]);
    //  Set segment low voltage
    await command(spi, dcGpio, 0xB4, [0xA0, 0xB5, 0x55]);
    //  Set VcomH voltage
    await command(spi, dcGpio, 0xBE, [0x05]);
    //  Contrast master
    await command(spi, dcGpio, 0xC7, [0x0F]);
    //  Precharge2
    await command(spi, dcGpio, 0xB6, [0x01]);
    // Contrast
    await command(spi, dcGpio, 0xC1, [0xFF, 0xFF, 0xFF]);

    // Normal display
    await command(spi, dcGpio, 0xAF, []);
    await command(spi, dcGpio, 0xA6, []);

    await updateScreen(spi, dcGpio);
};

init();
