const spiDevice = require('spi-device');
const Gpio = require('onoff').Gpio;
const sliceArray = (oldArray, length, newArray = []) => {
    newArray = newArray.concat([oldArray.slice(0, length)]);
    let left = oldArray.slice(length);
    return (left.length && sliceArray(left, length, newArray)) || newArray;
};

class Oled {
    constructor({rst, dc, width = 128, height = 128}) {
        this.device = {rst, dc, width, height};
    }

    async init() {
        this.initGpio();
        await this.initSpi();
        return this;
    }

    initGpio() {
        this.device.rst = new Gpio(this.device.rst, 'out');
        this.device.dc = new Gpio(this.device.dc, 'out');
    }

    async initSpi() {
        let spi = await new Promise((resolve, reject) => {
            var spi = spiDevice.open(0, 0, {maxSpeedHz: 19660800}, async(err) => (err && reject(err)) || (!err && resolve(spi)));
            // resolve({transfer: (collection, cb) => cb(null, collection)});
        });
        this.device.spi = spi;
    }

    async write(gpio, data) {
        return new Promise((resolve, reject) => {
            this.device[gpio].write(data, (err, res) => {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        });
    }

    async sendCommand(command, data = []) {
        await this.write('dc', 0);
        await this.spiTransfer([command]);
        await this.write('dc', 1);
        if (data.length) {
            console.log(11111111111111);
            await sliceArray(data, 4096)
            .reduce(async(p, chunk) => {
                    console.log(222222222222222);
                    await p;
                    return this.spiTransfer([chunk]);
                }, Promise.resolve());
        }
    }

    spiTransfer(bytes) {
        return (new Promise((resolve, reject) => this.device.spi.transfer([{sendBuffer: Buffer.from(bytes), byteLength: bytes.length}], (err, res) => {
            console.log(err, res);
            if (err) {
                return reject(err);
            }
            resolve(res);
        })));
    }

    async deviceReset() {
        await this.write('rst', 0);
        await this.write('rst', 1);
    }

    async deviceClearDisplay() {
        await this.deviceRefreshScreen(Array(this.device.width * this.device.height * 2).fill(0));
    }

    async deviceDisplayOn(contrast = 255) {
        await this.deviceReset();

        await this.sendCommand(0xFD, [0x12]);
        await this.sendCommand(0xFD, [0xB1]); // await command A2,B1,B3,BB,BE,C1 accessible if in unlock state
        await this.sendCommand(0xAE); // Display off
        await this.sendCommand(0xB3, [0xF1]); // Clock divider
        await this.sendCommand(0xCA, [0x7F]); // Mux ratio
        await this.sendCommand(0x15, [0x00, 0x7F]); // Set column address
        await this.sendCommand(0x75, [0x00, 0x7F]); // Set row address
        await this.sendCommand(0xA0, [0x74]); // Segment remapping - Column address remapping or else everything is mirrored
        await this.sendCommand(0xA1, [0x00]); // Set Display start line
        await this.sendCommand(0xA2, [0x00]); // Set display offset
        await this.sendCommand(0xB5, [0x00]); // Set GPIO
        await this.sendCommand(0xAB, [0x01]); // Function select (internal - diode drop)
        await this.sendCommand(0xB1, [0x32]); // Precharge
        await this.sendCommand(0xB4, [0xA0, 0xB5, 0x55]); // Set segment low voltage
        await this.sendCommand(0xBE, [0x05]); // Set VcomH voltage
        await this.sendCommand(0xC7, [0x0F]); // Contrast master
        await this.sendCommand(0xB6, [0x01]); // Precharge2
        await this.sendCommand(0xC1, [contrast, contrast, contrast]); // Contrast
        await this.sendCommand(0xAF); // Normal display
        await this.sendCommand(0xA6); // Normal display
    }

    async deviceRefreshScreen(data) {
        await this.sendCommand(0x15, [0, 127]);
        await this.sendCommand(0x75, [0, 127]);
        await this.sendCommand(0x5C, data);
    }

    async deviceSendRaw(data) {
        if (data.length % 8 !== 0) {
            throw new Error('setRawData the size of the array is incorrect');
        }
        await this.deviceRefreshScreen(data);
    }
}

Oled.RGBToRGB565 = (r, g, b) => {
    let red = +r;
    let green = +g;
    let blue = +b;

    if (isNaN(red) || isNaN(green) || isNaN(blue) || red < 0 || red > 255 || green < 0 || green > 255 || blue < 0 || blue > 255) {
        throw new Error(`Rgb colour ${r} ${g} ${b} is not a valid hexadecimal colour`);
    }
    return [(red & 0xF8 | green >> 5), ((green & 0x1C) << 3) | (blue >> 3)];
};

module.exports = Oled;
