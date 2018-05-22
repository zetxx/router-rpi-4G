var fonts = require('./fonts');

const alloc = (width, height, fill = 0) => {
    if (width < 8) {
        throw new Error('width myst be more than 8');
    }
    if (width % 8 !== 0) {
        throw new Error('width myst be dividable by 8');
    }
    if (height < 1) {
        throw new Error('height myst be more than 1');
    }

    return (new Array(height)).fill(0).map(() => (new Array(width / 8)).fill(fill));
};
const drawByte = (byte) => {
    var textbyte = '';
    for (let i = 0; i <= 7; i++) {
        textbyte += ((byte << i & 128) === 128 ? '☻' : ' ');
    }
    return textbyte;
};
const textart = (plate) => {
    return plate.map((line) => {
        return line.reduce((a, byte) => a + drawByte(byte), '');
    }, '').join('|\n');
};

const writeLetter = (x, y, plate, hex, fontMeta) => {
    if (hex) {
        var newPlate = hex.reduce((a, v, idx) => {
            a[idx + y][x] = v;
            return a;
        }, plate);
        return newPlate;
    }
    return plate;
};

const addText = (plateIn, text, fontData, fontMeta, line = 0) => {
    var hexArray = text.split('').map((letter) => fontData[letter.charCodeAt(0).toString()]);
    var newPlate = hexArray
        .reduce((plate, hexLetter, idx) => writeLetter(idx, line, plate, hexLetter, fontMeta), plateIn);
    return newPlate;
};

const drawGraph = (plateIn, [drawableDataPrim, drawableDataSec], line, topLine) => {
    if (!line) {
        return plateIn;
    }

    plateIn[topLine] = plateIn[topLine].map((byte, idx) => {
        for (var i = 0; i <= 7; i++) {
            var realIdx = (idx * 8) + i;
            var dp = drawableDataPrim[realIdx];
            var ds = drawableDataSec[realIdx];
            if (dp >= line && ds !== line) {
                byte = byte | (128 >> i);
            } else if (dp < line && ds === line) {
                byte = byte | (128 >> i);
            }
        }
        return byte;
    });
    return drawGraph(plateIn, [drawableDataPrim, drawableDataSec], line - 1, topLine + 1);
};

const addGraph = (plateIn, width, data, topLine = 0, bottomLine = 1) => {
    var totalLines = bottomLine - topLine;
    var pixelPerPercent = (totalLines) / 100;
    var drawableDataPrim = (new Array(width)).fill(0).concat(data[0]).slice(width * -1).map((v) => Math.floor(v * pixelPerPercent));
    var drawableDataSec = (new Array(width)).fill(0).concat(data[1]).slice(width * -1).map((v) => Math.floor(v * pixelPerPercent));
    return drawGraph(plateIn, [drawableDataPrim, drawableDataSec], totalLines, topLine);
};

const getPoints = (plate) => {
    var byteTmpl = (new Array(8)).fill(0).map((digit, idx) => (1 << idx)).reverse();
    return plate.reduce((lineArray, line, lineIdx) =>
        lineArray.concat(line.reduce((byteArray, byte, byteIdx) =>
            byteArray.concat(byteTmpl.map((tmpl, tmplIdx) => [(byteIdx * 8) + tmplIdx + 1, lineIdx + 1, ((byte & tmpl) === tmpl) && 1 || 0])),
            []
        ))
        ,
        []
    );
};

module.exports = (width, height, font) => {
    var plate = alloc(width, height);
    var fontData = fonts[font].data;
    var fontMeta = fonts[font].meta;

    var o = {
        addText: (text, line = 0) => ((plate = addText(plate, text, fontData, fontMeta, line)) && o),
        addGraph: (data, newWidth, fromLine = 0, toLine = 1) => ((plate = addGraph(plate, newWidth || width, data, fromLine, toLine)) && o),
        textart: () => textart(plate),
        getFrameBuffer: () => plate.reduce((a, line) => a.concat(line), []),
        getPoints: () => getPoints(plate)
    };
    return o;
};
