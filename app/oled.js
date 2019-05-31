const spiDevice = require('spi-device');
const Gpio = require('onoff').Gpio;
const sliceArray = (oldArray, length, newArray = []) => {
    newArray = newArray.concat([oldArray.slice(0, length)]);
    let left = oldArray.slice(length);
    return (left.length && sliceArray(left, length, newArray)) || newArray;
};

class Oled {
    constructor({rst, dc}) {
        this.oled = {
            rst: new Gpio(rst, 'out'),
            dc: new Gpio(dc, 'out')
        };
        // return promise from constructor, so we can init spi async
        return new Promise(async(resolve, reject) => {
            this.oled.spi = await this.initSpi();
            return this;
        });
    }

    async initSpi() {
        return new Promise((resolve, reject) => {
            var spi = spiDevice.open(0, 0, {maxSpeedHz: 19660800}, async(err) => (err && reject(err)) || (!err && resolve(spi)));
        });
    }

    async write(gpio, data) {
        return new Promise((resolve, reject) => {
            this.oled[gpio].write(data, (err) => ((err && reject(err)) || resolve(1)));
        });
    }

    async sendCommand(command, data) {
        await this.write('dc', 0);
        await this.sendBytes([command]);
        await this.write('dc', 1);
        if (data.length) {
            await sliceArray(data, 4096)
                .map(async(chunk) => this.spiSendBytes(Buffer.from(chunk)));
        }
    }

    async spiSendBytes(bytes) {
        return new Promise((resolve, reject) => {
            let message = [{
                sendBuffer: Buffer.from(bytes),
                byteLength: bytes.length
            }];

            this.oled.spi.transfer(message, (err, message) => ((!err && resolve()) || (err && reject(err))));
        });
    }
}

module.exports = async function({rst = 0, dc = 0}) {
    return (new Oled({rst, dc}));
};
