const spi = require('spi-device');
const Gpio = require('onoff').Gpio;
let oled;
const lineSpacing = 1, letterSpacing = 1, WIDTH = 128, HEIGHT = 128;
let bytesData = [];
let rstGpio, rstGpioId, dcGpio, dcGpioId;
let cursor_x = 0, cursor_y = 0;

async function command(dataCommand, data) {
    console.log('---', dataCommand, data);
    dcGpio.writeSync(0);
    await sendBytes([dataCommand]);
    dcGpio.writeSync(1);
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

async function initializeSpiConnection() {
    return new Promise((resolve, reject) => {
        oled = spi.open(0, 0, {
            maxSpeedHz: 19660800 //Divisor is 65536
        }, async function (err) {
            if (err) {
                console.error(err);
                reject(err);
            }
            else {
                console.info('oled initialized');
                resolve();
            }
        });
    });
}

async function disconnectSpi() {
    return new Promise((resolve, reject) => {
        oled.close(function (err) {
            oled = undefined;
            if (err) {
                reject(err);
            }
            else {
                resolve();
            }
        })
    });
}

/**
 * Convert hexadecimal colour to rgb model.
 * @param {String} input
 */
function drawBitmapChar(byteArrays, colour) {
    var x = 0,
        y = 0
    const colourBytes = Ssd1351.convertRgbColourToRgb565(colour.r, colour.g, colour.b);

    for (var k = 0; k < byteArrays.length; k++) {
        cursor_y = cursor_y - 8;
        var byteArray = readCharBytes(byteArrays[k]);
        for (var i = 0; i < byteArray.length; i += 1) {
            for (var j = 0; j < 8; j += 1) {
                var xpos, ypos;
                xpos = x + i;
                ypos = y + j;
                bytesData[(xpos + cursor_x) * 2 + (ypos + cursor_y) * 128 * 2] = colourBytes[0] * byteArray[i][j];
                bytesData[(xpos + cursor_x) * 2 + (ypos + cursor_y) * 128 * 2 + 1] = colourBytes[1] * byteArray[i][j];
            }
        }
    }
}

function readCharBytes(byteArray) {
    var bitArr = [],
        bitCharArr = [];
    // loop through each byte supplied for a char
    for (var i = 0; i < byteArray.length; i += 1) {
        // set current byte
        var byte = byteArray[i];
        // read each byte
        for (var j = 0; j < 8; j += 1) {
            // shift bits right until all are read
            var bit = byte >> j & 1;
            bitArr.push(bit);
        }
        // push to array containing flattened bit sequence
        bitCharArr.push(bitArr);
        // clear bits for next byte
        bitArr = [];
    }
    return bitCharArr;
}

function drawChar(byteArray, size, colour) {
    var x = 0,
        y = 0,
        k = 0,
        l = 0;
    const r = colour.r, g = colour.g, b = colour.b;

    for (var i = 0; i < byteArray.length; i += 1) {
        for (var j = 0; j < 8; j += 1) {
            var xpos, ypos;
            if (size === 1) {
                xpos = x + i;
                ypos = y + j;
                const byte1 = (r & 0xF8 | g >> 5) * byteArray[i][j], byte2 = (g << 5 & 0xE0 | b >> 3) * byteArray[i][j];
                bytesData[(xpos + cursor_x) * 2 + (ypos + cursor_y) * 128 * 2] = byte1;
                bytesData[(xpos + cursor_x) * 2 + (ypos + cursor_y) * 128 * 2 + 1] = byte2;
            }
            else {
                xpos = x + (i * size);
                ypos = y + (j * size);
                const byte1 = (r & 0xF8 | g >> 5) * byteArray[i][j], byte2 = (g << 5 & 0xE0 | b >> 3) * byteArray[i][j];
                for (k = 0; k < size; k++) {
                    for (l = 0; l < size; l++) {
                        bytesData[(xpos + k + cursor_x) * 2 + (ypos + l + cursor_y) * 128 * 2] = byte1;
                        bytesData[(xpos + k + cursor_x) * 2 + (ypos + l + cursor_y) * 128 * 2 + 1] = byte2;
                    }
                }
            }
        }
    }
}

function findCharBuf(font, c) {
    var cBufPos = font.lookup.indexOf(c) * font.width;
    var cBuf = font.fontData.slice(cBufPos, cBufPos + font.width);
    return cBuf;
}

module.exports = class Ssd1351 {

    constructor(rstGpioNb = 25, dcGpioNb = 24) {
        rstGpioId = rstGpioNb;
        dcGpioId = dcGpioNb;
    }

    async  turnOnDisplay(initialContrast = 0xFF) {
        try {

            if (undefined === rstGpio) {
                rstGpio = new Gpio(rstGpioId, 'out');
            }
            if (undefined === dcGpio) {
                dcGpio = new Gpio(dcGpioId, 'out');
            }
            if (undefined === oled) {
                await initializeSpiConnection();
            }

            //Reset device
            rstGpio.writeSync(0);
            rstGpio.writeSync(1);

            await command(0xFD, [0x12]);
            //  await command A2,B1,B3,BB,BE,C1 accessible if in unlock state
            await command(0xFD, [0xB1]);
            // Display off
            await command(0xAE, []);
            //  Clock divider
            await command(0xB3, [0xF1]);
            //  Mux ratio
            await command(0xCA, [0x7F]);
            //  Set column address
            await command(0x15, [0x00, 0x7F]);
            //  Set row address
            await command(0x75, [0x00, 0x7F]);
            //  Segment remapping - Column address remapping or else everything is mirrored
            await command(0xA0, [0x74]);
            //  Set Display start line
            await command(0xA1, [0x00]);
            //  Set display offset
            await command(0xA2, [0x00]);
            //  Set GPIO
            await command(0xB5, [0x00]);
            // Function select (internal - diode drop)
            await command(0xAB, [0x01]);
            // Precharge
            await command(0xB1, [0x32]);
            //  Set segment low voltage
            await command(0xB4, [0xA0, 0xB5, 0x55]);
            //  Set VcomH voltage
            await command(0xBE, [0x05]);
            //  Contrast master
            await command(0xC7, [0x0F]);
            //  Precharge2
            await command(0xB6, [0x01]);
            // Contrast
            await command(0xC1, [initialContrast, initialContrast, initialContrast]);

            // Normal display
            await command(0xAF, []);
            await command(0xA6, []);

            for (let i = 0; i < 128 * 128 * 2; i++) {
                bytesData[i] = 1;
            }
        }
        catch (e) {
            console.error(e);
            throw e;
        }
    }

    async  turnOffDisplay() {
        try {
            //Reset device
            rstGpio.writeSync(0);
            rstGpio.writeSync(1);

            //Turn off screen
            await command(0xA4, []);
            await disconnectSpi();

            //Disconnect Gpio pins
            rstGpio.unexport();
            dcGpio.unexport();
            rstGpio = undefined;
            dcGpio = undefined;
        }
        catch (e) {
            console.error(e);
            throw e;
        }
    }

    clearDisplay() {
        bytesData = Array(128*128*2).fill(0);
        cursor_x = 0;
        cursor_y = 0;
    }

    async updateScreen() {
        await command(0x15, [0, 127]);
        await command(0x75, [0, 127]);
        await command(0x5C, bytesData);
    }

    setRawData(bytes) {
        if (bytes.length !== 128 * 128 * 2) {
            throw new Error('setRawData the size of the array is incorrect')
        }
        bytesData = bytes;
    }

    drawLine(x0, y0, x1, y1, colour = { r: 255, g: 255, b: 255 }) {
        // using Bresenham's line algorithm
        const colourBytes = Ssd1351.convertRgbColourToRgb565(colour.r, colour.g, colour.b);

        var dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1,
            dy = Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1,
            err = (dx > dy ? dx : -dy) / 2;

        while (true) {
            bytesData[x0 * 2 + y0 * 128 * 2] = colourBytes[0];
            bytesData[x0 * 2 + y0 * 128 * 2 + 1] = colourBytes[1];

            if (x0 === x1 && y0 === y1) break;

            var e2 = err;

            if (e2 > -dx) {
                err -= dy; x0 += sx;
            }
            if (e2 < dy) {
                err += dx; y0 += sy;
            }
        }
    }

    setCursor(x, y) {
        cursor_x = x;
        cursor_y = y;
    }

    getCursor() {
        return {
            x: cursor_x,
            y: cursor_y
        };
    }

    /**
     * Display a string using the oled-font-5x7 pixels font.
     * @param {*} font
     * @param {*} size
     * @param {*} string
     * @param {*} colour
     * @param {*} wrap
     * @param {*} padding
     */
    writeString(font, size, string, colour, wrap, padding) {
        var wordArr = string.split(' '),
            len = wordArr.length,
            // start x offset at cursor pos
            offset = cursor_x;
        //padding = 0;

        if (undefined === colour) {
            colour = { r: 255, g: 255, b: 255 };
        }

        // loop through words
        for (var w = 0; w < len; w += 1) {
            // put the word space back in for all in between words or empty words
            if (w < len - 1 || !wordArr[w].length) {
                wordArr[w] += ' ';
            }
            var stringArr = wordArr[w].split(''),
                slen = stringArr.length,
                compare = (font.width * size * slen) + (size * (len - 1));

            // wrap words if necessary
            if (wrap && len > 1 && (offset >= (WIDTH - compare))) {
                offset = 1;

                cursor_y += (font.height * size) + lineSpacing;
                this.setCursor(offset, cursor_y);
            }

            // loop through the array of each char to draw
            for (var i = 0; i < slen; i += 1) {
                if (stringArr[i] === '\n') {
                    offset = 0;
                    cursor_y += (font.height * size) + lineSpacing;
                    this.setCursor(offset, cursor_y);
                }
                else {
                    // look up the position of the char, pull out the buffer slice
                    var charBuf = findCharBuf(font, stringArr[i]);
                    // read the bits in the bytes that make up the char
                    var charBytes = readCharBytes(charBuf);
                    // draw the entire character
                    drawChar(charBytes, size, colour);

                    // calc new x position for the next char, add a touch of padding too if it's a non space char
                    //padding = (stringArr[i] === ' ') ? 0 : this.LETTERSPACING;
                    offset += (font.width * size) + letterSpacing;// padding;
                    // wrap letters if necessary
                    if (wrap && (offset >= (WIDTH - font.width - letterSpacing))) {
                        offset = 0;
                        cursor_y += (font.height * size) + lineSpacing;
                    }
                    // set the 'cursor' for the next char to be drawn, then loop again for next char
                    this.setCursor(offset, cursor_y);
                }
            }
        }
    }

    getStringWidth(font, size, string) {
        const wordArr = string.split(''), len = wordArr.length;
        return ((font.width * size) + letterSpacing) * len;
    }

    /**
     * Display a string using the specified outline font.
     * @param {String} input String to display
     * @param {Integer} spacing  Letter spacing
     */
    writeOutlineString(input, fontConverter, spacing = 0, colour = { r: 255, g: 255, b: 255 }, draw = true) {
        const charsBytes = fontConverter.convertStringToPixelChars(input);
        const cursorYInit = cursor_y;

        const maxHeight = Math.max(...charsBytes.map((charBytes) => {
            return charBytes.height;
        }));

        const maxWidth = Math.max(...charsBytes.map((charBytes) => {
            return charBytes.width;
        }));


        const reducer = (accumulator, currentValue) => accumulator + currentValue + spacing;
        let width = charsBytes.map((p) => p.width).reduce(reducer);

        //The icon is not drawn in the oled buffer
        if (!draw) {
            return {
                height: maxHeight, width: maxWidth
            }
        }

        //Erase display rectangle
        for (let k = 0; k < width + charsBytes.length * 5; k++) {
            for (let l = 0; l < maxHeight; l++) {
                bytesData[(k + cursor_x) * 2 + (l + cursor_y) * 128 * 2] = 0;
                bytesData[(k + cursor_x) * 2 + (l + cursor_y) * 128 * 2 + 1] = 0;
            }
        }
        //Draw characters
        charsBytes.forEach((charBytes) => {
            cursor_y = cursorYInit + maxHeight;
            drawBitmapChar(charBytes.data, colour);
            cursor_x = cursor_x + charBytes.width + spacing;
        });
        cursor_y = cursorYInit

        return {
            height: maxHeight, width: maxWidth
        }
    }

    /**
    * Set contrast.
    * @param {Integer} contrast Contrast value between 0 and 255
    */
    async setContrast(contrast) {
        if (0 > contrast) {
            contrast = 0;
            console.warn(`Contrast value ${contrast} is too low. Minimum value is 0.`)
        }
        else if (255 < contrast) {
            contrast = 255;
            console.warn(`Contrast value ${contrast} is too high. Maximum value is 0xFF.`)
        }
        await command(0xC1, [contrast, contrast, contrast]);
    }

    /**
     * Set the first row displayed
     * @param {Integer} row Row value between 0 and 127
     */
    async setVerticalScroll(row) {
        await command(0xA1, [row]);
    }

    static convertHexColourToRgb(hexcolour) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hexcolour);
        if (result) {
            return {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            }
        } else {
            throw new Error(`${hexcolour} is not a valid hexadecimal colour`);
        }
    }

    /**
     * Convert RGB 24 bit colour to a 16 bit colour compatible with the OLED SSD1351.
     * @param {Integer} r
     * @param {Integer} g
     * @param {Integer} b
     */
    static convertRgbColourToRgb565(r, g, b) {
        const red = +r, green = +g, blue = +b;
        if (isNaN(red) || isNaN(green) || isNaN(blue) || red < 0 || red > 255 || green < 0 || green > 255 || blue < 0 || blue > 255) {
            throw new Error(`Rgb colour ${r} ${g} ${b} is not a valid hexadecimal colour`);
        }
        return [(red & 0xF8 | green >> 5), ((green & 0x1C) << 3) | (blue >> 3)];
    }
}