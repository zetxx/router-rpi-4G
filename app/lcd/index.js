'use strict';
const i2c = require('i2c-bus');
const Oled = require('oled-i2c-bus');
const r = require('rethinkdb');
const draw = require('./draw');
const log = require('../log');

const width = 128;
const height = 64;
const trafficMonthly = 1024 * 1024 * 1024 * 20;
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
    return Math.floor((total / trafficMonthly) * 100);
};

const getGraph = (num) => {};

const pullData = (dbInst) => {
    return Promise.all([
        r.table('vpn').orderBy('id').limit(1).run(dbInst).then((r) => ((r && r.pop()) || {}))
            .then(({isActive = false}) => ({vpnStatus: (isActive && 'connected') || '?'})),
        r.table('gsm').orderBy('id').limit(1).run(dbInst).then((r) => ((r && r.pop()) || {}))
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
        r.table('dataUsage').orderBy('id').limit(1).run(dbInst).then((r) => ((r && r.pop()) || {}))
            .then(({usedTotal = 0}) => ({trafficUsed: getTraficUsedPercentage(usedTotal, 0)})),
        r.table('ping').orderBy('id').limit(1).run(dbInst).then((r) => ((r && r.pop()) || {}))
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
        realtimeTxBytes,
        realtimeRxBytes,
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
        .then(() => log.trace('done'));
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

module.exports = (dbInst, config) => {
    !o && lcdAddress !== 0 && i2cInit(lcdAddress).then((o) => (oled = o));

    env === 'dev' && setInterval(() => pullData(dbInst)
        .then(({trafficUp, trafficDown, vpnStatus, gsmNetwork, gsmNetworkStatus, ping, trafficUsed, realtimeTxBytes, realtimeRxBytes}) => (
            {trafficUp, trafficDown, vpnStatus, gsmNetwork, gsmNetworkStatus, ping, trafficUsed, realtimeTxBytes, realtimeRxBytes}
        )).then(log.trace.bind(log)), 3000);
    env !== 'dev' && setInterval(() => {
        return oled && redraw(dbInst);
    }, 10000);
};
