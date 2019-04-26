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
    d.addGraph(graph, 0, 34, 64);
    return d;
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

const getTrafficUsedPercentage = ({usedTotal, monthlyTraffic}) => Math.floor((parseInt(usedTotal) / parseInt(monthlyTraffic)) * 100);

const transformGraphData = (data) => {
    let t1 = data.reduce((a, {realtimeTxBytes, realtimeRxBytes}) => {
        a[0].push(realtimeRxBytes);
        a[1].push(realtimeTxBytes);
        return a;
    }, [[], []]);
    let percentDown = t1[0].concat([]).sort((a, b) => b - a).shift() / 100;
    let percentUp = t1[1].concat([]).sort((a, b) => b - a).shift() / 100;
    t1[0] = t1[0].reverse().map((v) => Math.round(v / percentDown, 0));
    t1[1] = t1[1].reverse().map((v) => Math.round(v / percentUp, 0));
    return t1;
};

const transformer = ({width, height}) => ({ping, provider, vpn, modem, graphData}, monthlyTraffic) => {
    let realtimeTxBytes = parseInt((modem && modem.data && modem.data.realtime_tx_bytes) || 0);
    let realtimeRxBytes = parseInt((modem && modem.data && modem.data.realtime_rx_bytes) || 0);
    return {
        width,
        height,
        vpnStatus: vpn && vpn.data && vpn.data.connected,
        ping: (ping && ping.data && `${ping.data.host}:${ping.data.value}${ping.data.units}`),
        gsmNetwork: (modem && modem.data && modem.data.network_type) || '-',
        gsmNetworkConnected: (modem && modem.data && modem.data.pppStatus && modem.data.pppStatus === 'ppp_connected') || false,
        trafficUp: getTrafficMetrics(realtimeTxBytes),
        trafficDown: getTrafficMetrics(realtimeRxBytes),
        graph: transformGraphData(graphData),
        trafficUsed: getTrafficUsedPercentage({usedTotal: (provider && provider.data && provider.data.trafficUsed) || 0, monthlyTraffic})
    };
};

const i2cInit = ({hwAddr, width, height}) => (new Promise((resolve, reject) => {
    const i2cBus = i2c.open(1, (err) => (err && reject(err)) || resolve(new Oled(i2cBus, {width, height, hwAddr})));
}));

const isReady = (wire) => (new Promise((resolve, reject) => wire._waitUntilReady(() => resolve())));

module.exports = async({hwAddr, width, height}) => {
    let t = transformer({width, height});

    if (!hwAddr) {
        return async(data, monthlyTraffic) => {
            return getPixelCoords(t(data, monthlyTraffic)).textArt();
        };
    }
    var wire = await i2cInit({hwAddr, width, height});
    return async(data, monthlyTraffic) => {
        await isReady(wire);
        await wire.clearDisplay(true);
        await isReady(wire);
        await wire.drawPixel(getPixelCoords(t(data, monthlyTraffic)).getPoints(), true);
        await isReady(wire);
        await wire.update();
        await isReady(wire);
        await wire.turnOnDisplay();
        await isReady(wire);
    };
};
