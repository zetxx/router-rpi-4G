'use strict';
const i2c = require('i2c-bus');
const Oled = require('oled-i2c-bus');
const r = require('rethinkdb');
const draw = require('./draw');
const log = require('../log');

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
    return d;
};

const i2cInit = (address) => (new Promise((resolve, reject) => {
    const i2cBus = i2c.open(1, (err) => (err && reject(err)) || resolve(new Oled(i2cBus, {width, height, address})));
}));

const isReady = () => (new Promise((resolve, reject) => oled._waitUntilReady(() => resolve(oled))));

const getTrafficUsedPercentage = ({usedTotal, monthlyTraffic}) => Math.floor((parseInt(usedTotal) / parseInt(monthlyTraffic)) * 100);

const transformGraphData = (data) => {
    var t1 = data.reduce((a, {realtimeTxBytes, realtimeRxBytes}) => {
        a[0].push(realtimeRxBytes);
        a[1].push(realtimeTxBytes);
        return a;
    }, [[], []]);
    var percentDown = t1[0].concat([]).sort((a, b) => b - a).shift() / 100;
    var percentUp = t1[1].concat([]).sort((a, b) => b - a).shift() / 100;
    t1[0] = t1[0].reverse().map((v) => Math.round(v / percentDown, 0));
    t1[1] = t1[1].reverse().map((v) => Math.round(v / percentUp, 0));
    return t1;
};

const pullData = (dbInst, {internetProvider: {monthlyTraffic}}) => {
    return Promise.all([
        r.table('vpn').orderBy(r.desc('insertTime')).limit(1).run(dbInst).then((r) => ((r && r.pop()) || {}))
            .then(({isActive = false}) => ({vpnStatus: (isActive && 'connected') || '?'})),
        r.table('gsm').orderBy(r.desc('insertTime')).limit(1).run(dbInst).then((r) => ((r && r.pop()) || {}))
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
        r.table('gsm').orderBy(r.desc('insertTime')).limit(126).run(dbInst).then((r = []) => ({graph: transformGraphData(r)})),
        r.table('dataUsage').orderBy(r.desc('insertTime')).limit(1).run(dbInst).then((r) => ((r && r.pop()) || {}))
            .then(({usedTotal = 0}) => ({trafficUsed: getTrafficUsedPercentage({usedTotal, monthlyTraffic})})),
        r.table('ping').orderBy(r.desc('insertTime')).limit(1).run(dbInst).then((r) => ((r && r.pop()) || {}))
            .then(({host = '?', time = '?'}) => ({pingHost: host, pingTime: time}))
    ])
    .then((data) => data.reduce((a, c) => (Object.assign(a, c)), {}))
    .then(({trafficUp, trafficDown, vpnStatus, gsmNetworkStatus, gsmNetwork, pingHost, pingTime, trafficUsed, realtimeTxBytes, realtimeRxBytes, graph}) => Promise.resolve({
        gsmNetwork,
        gsmNetworkStatus,
        vpnStatus,
        ping: `${pingHost}:${pingTime}`,
        trafficUp,
        trafficDown,
        trafficUsed,
        realtimeTxBytes,
        realtimeRxBytes,
        graph
    }));
};

const redraw = (dmInst, config) => {
    Promise.resolve()
        .then(isReady)
        .then(() => oled.turnOffDisplay())
        .then(isReady)
        .then(() => oled.clearDisplay(true))
        .then(isReady)
        .then(() => pullData(dmInst, config))
        .then((data) => oled.drawPixel(getPixelCoords(data).getPoints(), true))
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
    if (config.lcd.addr !== 0) {
        !o && config.env !== 'dev' && i2cInit(parseInt(config.lcd.addr)).then((o) => (oled = o));

        config.env === 'dev' && setInterval(() => pullData(dbInst, config)
            .then((data) => getPixelCoords(data).textart())
            .then(console.log)
            .then(log.trace.bind(log)), 3000);
        config.env !== 'dev' && setInterval(() => {
            return oled && redraw(dbInst, config);
        }, 10000);
    }
};
