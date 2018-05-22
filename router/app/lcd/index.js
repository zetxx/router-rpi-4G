'use strict';
// const oled = require('oled-js-pi');
const draw = require('./draw');

module.exports = () => {
    var d = draw(128, 64, '1_8x8');
    d.addText('NET:4G ✓ | VPN:✗', 0);
    d.addText('google: 1024ms', 8);
    d.addText(`${String.fromCharCode(24)}1024Mb ${String.fromCharCode(25)}1024Mb`, 17);
    d.addText('USED: 56%', 25);
    d.addGraph([new Array(126).fill(0).map((v, idx) => idx), new Array(126).fill(0).map((v, idx) => 100 - idx)], 0, 34, 64);
    console.log((new Array(128)).fill('-').join(''));
    console.log(d.textart());
    console.log((new Array(128)).fill('-').join(''));
    console.log(JSON.stringify(d.getPoints()));
};
