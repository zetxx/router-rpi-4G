const spiDevice = require('spi-device');
const Gpio = require('onoff').Gpio;

class oled {
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
            var spi = spiDevice.open(0, 0, {maxSpeedHz: 19660800}, async (err) => (err && reject(err)) || (!err && resolve(spi)));
        });
    }

    async write(gpio, data) {
        return new Promise((resolve, reject) => {
            this.oled[gpio].write(data, (err) => ((err && reject(err)) || resolve(1)));
        });
    }

    async sendCommand(command, data) {
        await this.write('dc', 0);
        await sendBytes([dataCommand]);
        await this.write('dc', 1);
        if (0 === data.length) {
            return;
        }

        for (let i = 0; i < data.length; i = i + 4096) {
            {
                const dataToSend = Buffer.from(data.slice(i, i + 4096))
                await sendBytes(dataToSend);
            }
        }
    }

    async function sendBytes(bytes) {
        return new Promise((resolve, reject) => {
            const message = [{
                sendBuffer: Buffer.from(bytes),
                byteLength: bytes.length
            }];

            oled.transfer(message, function (err, message) {
                if (err) {
                    console.error(err);
                    reject(err);
                    return;
                }
                resolve();
            });
        });
    }
}

module.exports = oled;
