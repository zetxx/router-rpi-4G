'use strict';
const draw = require('./draw');
const i2c = require('i2c-bus');
const Oled = require('oled-i2c-bus');
const getVpnStatus = require('../db/models/vpnStatus');
const getGsmStatsModel = require('../db/models/gsmStatus');
const getPingStatsModel = require('../db/models/pingStatus');

const width = 128;
const height = 64;
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

const pullData = (sequelize) => {
    return Promise.all([
        getVpnStatus(sequelize).find({order: [['id', 'DESC']], limit: 1}).then((r) => (r || {}))
            .then(({isActive = false}) => ({vpnStatus: (isActive && 'connected') || '?'})),
            getGsmStatsModel(sequelize).find({order: [['id', 'DESC']], limit: 1}).then((r) => (r || {}))
                .then(({network_type = false, network = '?', realtime_rx_bytes = 0, realtime_tx_bytes = 0, ppp_status = ''}) => ({gsmNetworkStatus: (ppp_status === 'ppp_connected' && 'connected') || '?', gsmNetwork: network_type.slice(-5), trafficUp: getTrafficMetrics(realtime_tx_bytes), trafficDown: getTrafficMetrics(realtime_rx_bytes)})),
        getPingStatsModel(sequelize).find({order: [['id', 'DESC']], limit: 1}).then((r) => (r || {}))
            .then(({host = '?', time = '?'}) => ({pingHost: host, pingTime: time}))
    ])
    .then((data) => data.reduce((a, c) => (Object.assign(a, c)), {}))
    .then(({trafficUp, trafficDown, vpnStatus, gsmNetworkStatus, gsmNetwork, pingHost, pingTime}) => Promise.resolve({
        gsmNetwork,
        gsmNetworkStatus,
        vpnStatus,
        ping: `${pingHost}:${pingTime}`,
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

module.exports = (sequelize, lcdAddress) => {
    !o && i2cInit(lcdAddress).then((o) => (oled = o));

    setInterval(() => pullData(sequelize)
        .then(({trafficUp, trafficDown, vpnStatus, gsmNetwork, gsmNetworkStatus, ping}) => ({trafficUp, trafficDown, vpnStatus, gsmNetwork, gsmNetworkStatus, ping})).then(console.log), 5000);
    // setInterval(() => {
    //     return oled && redraw(sequelize);
    // }, 10000);
};
