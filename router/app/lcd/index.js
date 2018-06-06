'use strict';
const draw = require('./draw');
const i2c = require('i2c-bus');
const Oled = require('oled-i2c-bus');
const getTrafficStatsModel = require('../db/models/traficStats');

const width = 128;
const height = 64;
const address = 0x3C;
var oled;

const getPixelCoords = ({gsmNetwork, gsmNetworkStatus, vpnStatus, ping, trafficUp, trafficDown, trafficUsed, graph}) => {
    var d = draw(width, height, '1_8x8');
    d.addText(`NET:${gsmNetwork}G ${gsmNetworkStatus === 'connected' ? '✓' : '✗'} | VPN:${vpnStatus === 'connected' ? '✓' : '✗'}`, 0);
    d.addText(`google: ${ping}`, 8);
    d.addText(`${String.fromCharCode(24)}${trafficUp} ${String.fromCharCode(25)}${trafficDown}`, 17);
    d.addText(`traffic: ${trafficUsed}%`, 25);
    d.addGraph(graph, 0, 34, 64);
    return d.getPoints();
};

const i2cInit = () => {
    return new Promise((resolve, reject) => {
        const i2cBus = i2c.open(1, (err) => (err && reject(err)) || resolve(new Oled(i2cBus, {width, height, address})));
    });
};

const isReady = () => {
    return new Promise((resolve, reject) => oled._waitUntilReady(() => resolve(oled)));
};

const pullData = (sequelize) => {
    return Promise.all([
        getTrafficStatsModel(sequelize).find({order: [['id', 'DESC']]}).then(({download, upload}) => ({trafficUp: getTrafficMetrics(upload), trafficDown: getTrafficMetrics(download)}))
    ])
    .then((data) => data.reduce((a, c) => (Object.assign(a, c)), {}))
    .then(({trafficUp, trafficDown}) => Promise.resolve({
        gsmNetwork: '4',
        gsmNetworkStatus: 'connected',
        ping: (Math.random() * 100000).toString().slice(0, 4) + 'ms',
        trafficUp,
        trafficDown,
        trafficUsed: (Math.random() * 100000).toString().slice(0, 2),
        graph: [new Array(126).fill(0).map((v, idx) => idx), new Array(126).fill(0).map((v, idx) => 100 - idx)]
    }));
};

const redraw = (sequelize) => {
    Promise.resolve()
        .then(isReady)
        .then(() => oled.turnOffDisplay())
        .then(isReady)
        .then(() => oled.clearDisplay(true))
        .then(isReady)
        .then(() => pullData(sequelize))
        .then((data) => oled.drawPixel(getPixelCoords(data), true))
        .then(isReady)
        .then(() => oled.update())
        .then(isReady)
        .then(() => oled.turnOnDisplay())
        .then(isReady)
        .then(() => console.log('done'));
};

const getTrafficMetrics = (num) => {
    if (num <= 1024) {
        return `${num}b`;
    } else if ((num / 1024) <= 1024) {
        return `${Math.round(num / 1024)}Kb`;
    } else if ((num / (1024 * 1024)) <= 1024) {
        return `${Math.round(num / (1024 * 1024))}Mb`;
    } else {
        return `${Math.round(num / (1024 * 1024 * 1024))}Gb`;
    }
};

i2cInit()
    .then((o) => (oled = o));

module.exports = (sequelize) => {
    pullData(sequelize).then((data) => {debugger})
    // setInterval(() => {
    //     return oled && redraw(sequelize);
    // }, 10000);
};
