'use strict';
const i2c = require('i2c-bus');
const Oled = require('oled-i2c-bus');
const draw = require('./draw');

const getPixelCoords = ({width, height, gsmNetwork, gsmNetworkConnected, vpnStatus, ping, trafficUp, trafficDown, trafficUsed, graph}) => {
    var d = draw(width, height, '1_8x8');
    d.addText(`${gsmNetwork}${(gsmNetworkConnected && '✓') || '✗'}| VPN:${(vpnStatus && '✓') || '✗'}`, 0);
    d.addText((ping && ping.slice(-8)) || '?:?', 8);
    d.addText(`${String.fromCharCode(24)}${trafficUp} ${String.fromCharCode(25)}${trafficDown}`, 17);
    d.addText(`traffic: ${trafficUsed}%`, 25);
    // d.addGraph(graph, 0, 34, 64);
    return d;
};

const i2cInit = ({hwAddr, width, height}) => (new Promise((resolve, reject) => {
    const i2cBus = i2c.open(1, (err) => (err && reject(err)) || resolve(new Oled(i2cBus, {width, height, hwAddr})));
}));

const isReady = (wire) => (new Promise((resolve, reject) => wire._waitUntilReady(() => resolve())));

// const getTrafficUsedPercentage = ({usedTotal, monthlyTraffic}) => Math.floor((parseInt(usedTotal) / parseInt(monthlyTraffic)) * 100);

// const transformGraphData = (data) => {
//     var t1 = data.reduce((a, {realtimeTxBytes, realtimeRxBytes}) => {
//         a[0].push(realtimeRxBytes);
//         a[1].push(realtimeTxBytes);
//         return a;
//     }, [[], []]);
//     var percentDown = t1[0].concat([]).sort((a, b) => b - a).shift() / 100;
//     var percentUp = t1[1].concat([]).sort((a, b) => b - a).shift() / 100;
//     t1[0] = t1[0].reverse().map((v) => Math.round(v / percentDown, 0));
//     t1[1] = t1[1].reverse().map((v) => Math.round(v / percentUp, 0));
//     return t1;
// };

// const pullData = (dbInst, {internetProvider: {monthlyTraffic}}) => {
//     return Promise.all([
//         r.table('vpn').orderBy({index: r.desc('insertTime')}).limit(1).run(dbInst)
//             .then((cursor) => cursor.toArray())
//             .then((res) => ((res && res.pop()) || {}))
//             .then(({isActive = false}) => ({vpnStatus: (isActive && 'connected') || '?'})),
//         r.table('gsm').orderBy({index: r.desc('insertTime')}).limit(1).run(dbInst)
//             .then((cursor) => cursor.toArray())
//             .then((res) => ((res && res.pop()) || {}))
//             .then(({
//                 networkType = '',
//                 network = '?',
//                 realtimeRxBytes = 0,
//                 realtimeTxBytes = 0,
//                 pppStatus = ''
//             }) => ({
//                 gsmNetworkConnected: (pppStatus === 'ppp_connected' && 'connected') || '?',
//                 gsmNetwork: networkType.slice(-5),
//                 trafficUp: getTrafficMetrics(realtimeTxBytes),
//                 realtimeTxBytes,
//                 trafficDown: getTrafficMetrics(realtimeRxBytes),
//                 realtimeRxBytes
//             })),
//         r.table('gsm').orderBy({index: r.desc('insertTime')}).limit(126).run(dbInst)
//             .then((cursor) => cursor.toArray())
//             .then((res = []) => ({graph: transformGraphData(res)})),
//         r.table('dataUsage').orderBy({index: r.desc('insertTime')}).limit(1).run(dbInst)
//             .then((cursor) => cursor.toArray())
//             .then((res) => ((res && res.pop()) || {}))
//             .then(({usedTotal = 0}) => ({trafficUsed: getTrafficUsedPercentage({usedTotal, monthlyTraffic})})),
//         r.table('ping').orderBy({index: r.desc('insertTime')}).limit(1).run(dbInst)
//             .then((cursor) => cursor.toArray())
//             .then((res) => ((res && res.pop()) || {}))
//             .then(({host = '?', time = '?'}) => ({pingHost: host, pingTime: time}))
//     ])
//         .then((data) => data.reduce((a, c) => (Object.assign(a, c)), {}))
//         .then(({trafficUp, trafficDown, vpnStatus, gsmNetworkConnected, gsmNetwork, pingHost, pingTime, trafficUsed, realtimeTxBytes, realtimeRxBytes, graph}) => Promise.resolve({
//             gsmNetwork,
//             gsmNetworkConnected,
//             vpnStatus,
//             ping: `${pingHost}:${pingTime}`,
//             trafficUp,
//             trafficDown,
//             trafficUsed,
//             realtimeTxBytes,
//             realtimeRxBytes,
//             graph
//         }));
// };

// const redraw = (dmInst, config) => {
//     return Promise.resolve()
//         .then(isReady)
//         .then(() => pullData(dmInst, config)
//             .then((data) => {
//                 return Promise.resolve()
//                     .then(() => oled.clearDisplay(true))
//                     .then(isReady)
//                     .then(() => data);
//             }))
//         .then((data) => oled.drawPixel(getPixelCoords(data).getPoints(), true))
//         .then(isReady)
//         .then(() => oled.update())
//         .then(isReady)
//         .then(() => oled.turnOnDisplay())
//         .then(isReady)
//         .then(() => log.trace('done'));
// };

// const getTrafficMetrics = (num) => {
//     if (num <= 1024) {
//         return `${num}b`;
//     } else if ((num / 1024) <= 1024) {
//         return `${Math.round(num / 1024)}Kb`;
//     } else if ((num / (1024 * 1024)) <= 1024) {
//         return `${Math.round(num / (1024 * 1024))}Mb`;
//     } else {
//         return `${Math.round(num / (1024 * 1024 * 1024))}Gb`;
//     }
// };

module.exports = async({hwAddr, width, height}) => {
    const transformator = ({ping, provider, vpn}) => ({
        width,
        height,
        vpnStatus: vpn && vpn.data && vpn.data.connected,
        ping: (ping && ping.data && `${ping.data.host}:${ping.data.value}${ping.data.units}`),
        gsmNetwork: '?',
        gsmNetworkConnected: false,
        trafficUp: '?',
        trafficDown: '?',
        trafficUsed: (provider && provider.data && provider.data.trafficUsed) || '?'
    });
    if (!hwAddr) {
        return async(data) => {
            return getPixelCoords(transformator(data)).textArt();
        };
    }
    var wire = await i2cInit({hwAddr, width, height});
    return async(data) => {
        await isReady(wire);
        await wire.clearDisplay(true);
        await wire.drawPixel(getPixelCoords(transformator(data)).getPoints(), true);
        await wire.update();
        await wire.turnOnDisplay();
    };
};
