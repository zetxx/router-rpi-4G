'use strict';
const draw = require('./draw');
const i2c = require('i2c-bus');
const Oled = require('oled-i2c-bus');
const getVpnStatus = require('../db/models/vpnStatus');
const getGsmStatsModel = require('../db/models/gsmStatus');
const getPingStatsModel = require('../db/models/pingStatus');
const getDataUsageModel = require('../db/models/dataUsage');

const width = 128;
const height = 64;
const traficMounthly = 1024 * 1024 * 1024 * 20;
var oled, o;

const getPixelCoords = ({gsmNetwork, gsmNetworkStatus, vpnStatus, ping, trafficUp, trafficDown, trafficUsed, graph}) => {
    var d = draw(width, height, '1_8x8');
    d.addText(`${gsmNetwork}${gsmNetworkStatus === 'connected' ? '✓' : '✗'}| VPN:${vpnStatus === 'connected' ? '✓' : '✗'}`, 0);
    d.addText(ping, 8);
    d.addText(`${String.fromCharCode(24)}${trafficUp} ${String.fromCharCode(25)}${trafficDown}`, 17);
    d.addText(`traffic: ${trafficUsed}%`, 25);
    d.addGraph(graph, 0, 34, 64);
    return d.getPoints();
};

const i2cInit = (address) => {
    return new Promise((resolve, reject) => {
        const i2cBus = i2c.open(1, (err) => (err && reject(err)) || resolve(new Oled(i2cBus, {width, height, address})));
    });
};

const isReady = () => {
    return new Promise((resolve, reject) => oled._waitUntilReady(() => resolve(oled)));
};

const getTraficUsedPercentage = (up, down) => {
    var total = parseInt(up) + parseInt(down);
    return Math.floor((total / traficMounthly) * 100);
};

const dashToCamelCase = (c) => {
    if (c.dataValues) {
        var o = c.dataValues;
        return Object.keys(o).reduce((a, f) => {
            var newField = f.split('_').map((v, idx) => ((idx && v.split('').map((v2, idx2) => ((!idx2 && v2.toUpperCase()) || v2)).join('')) || v)).join('');
            a[newField] = o[f];
            return a;
        }, {});
    }
    return c;
};

const pullData = (sequelize) => {
    return Promise.all([
        getVpnStatus(sequelize).find({order: [['id', 'DESC']], limit: 1}).then((r) => (r || {}))
            .then(({isActive = false}) => ({vpnStatus: (isActive && 'connected') || '?'})),
        getGsmStatsModel(sequelize).find({order: [['id', 'DESC']], limit: 1}).then((r) => dashToCamelCase(r || {}))
            .then(({
                networkType = '',
                network = '?',
                realtimeRxBytes = 0,
                realtimeTxBytes = 0,
                pppStatus = ''
            }) => ({
                gsmNetworkStatus: (pppStatus === 'ppp_connected' && 'connected') || '?',
                gsmNetwork: networkType.slice(-5),
                trafficUp: getTrafficMetrics(realtimeTxBytes),
                realtimeTxBytes,
                trafficDown: getTrafficMetrics(realtimeRxBytes),
                realtimeRxBytes
            })),
        getDataUsageModel(sequelize).find({order: [['id', 'DESC']], limit: 1}).then((r) => (r || {}))
            .then(({usedTotal = 0}) => ({trafficUsed: getTraficUsedPercentage(usedTotal, 0)})),
        getPingStatsModel(sequelize).find({order: [['id', 'DESC']], limit: 1}).then((r) => (r || {}))
            .then(({host = '?', time = '?'}) => ({pingHost: host, pingTime: time}))
    ])
    .then((data) => data.reduce((a, c) => (Object.assign(a, c)), {}))
    .then(({trafficUp, trafficDown, vpnStatus, gsmNetworkStatus, gsmNetwork, pingHost, pingTime, trafficUsed, realtimeTxBytes, realtimeRxBytes}) => Promise.resolve({
        gsmNetwork,
        gsmNetworkStatus,
        vpnStatus,
        ping: `${pingHost}:${pingTime}`,
        trafficUp,
        trafficDown,
        trafficUsed,
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

module.exports = (sequelize, lcdAddress) => {
    !o && lcdAddress !== 0 && i2cInit(lcdAddress).then((o) => (oled = o));

    setInterval(() => pullData(sequelize)
        .then(({trafficUp, trafficDown, vpnStatus, gsmNetwork, gsmNetworkStatus, ping, trafficUsed}) => (
            {trafficUp, trafficDown, vpnStatus, gsmNetwork, gsmNetworkStatus, ping, trafficUsed}
        )).then(console.log), 30000);
    // setInterval(() => {
    //     return oled && redraw(sequelize);
    // }, 10000);
};
