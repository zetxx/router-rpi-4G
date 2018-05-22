const i2c = require('i2c-bus');
const Oled = require('oled-i2c-bus');
const draw = require('./lcd/draw');

const width = 128;
const height = 64;
const address = 0x3C;

const i2cInit = () => {
    return new Promise((resolve, reject) => {
        const i2cBus = i2c.open(1, (err) => (err && reject(err)) || resolve(new Oled(i2cBus, {width, height, address})))
    });
};

const drawCoords = ({gsmNetwork, gsmNetworkStatus, vpnStatus, ping, trafficUp, trafficDown, trafficUssed, graph}) => {
    var d = draw(width, height, '1_8x8');
    d.addText(`NET:${gsmNetwork} ${gsmNetworkStatus === 'connected' ? '✓' : '✗'} | VPN:${vpnStatus === 'connected' ? '✓' : '✗'}`, 0);
    d.addText(`ping -> google: ${ping}`, 8);
    d.addText(`${String.fromCharCode(24)}${trafficUp} ${String.fromCharCode(25)}${trafficDown}`, 17);
    d.addText(`traffic: ${trafficUssed}`, 25);
    d.addGraph(graph, 0, 34, 64);
    return d.getPoints();
};

const isReady = (oled) => {
    return new Promise((resolve, reject) => oled._waitUntilReady(() => resolve(oled)));
};

i2cInit()
.then(isReady)
.then((oled) => oled.turnOffDisplay() || oled)
.then(isReady)
.then((oled) => oled.clearDisplay(true) || oled)
.then(isReady)
.then((oled) => oled.clearDisplay(true) || oled)
.then(isReady)
.then((oled) => oled.drawPixel(drawCoords({
    gsmNetwork: '4G',
    gsmNetworkStatus: 'connected',
    ping: '1024ms',
    trafficUp: '1024Mb',
    trafficDown: '800Mb',
    traffic: '800%',
    graph: [new Array(126).fill(0).map((v, idx) => idx), new Array(126).fill(0).map((v, idx) => 100 - idx)]
}), true) || oled)
.then(isReady)
.then((oled) => oled.update() || oled)
.then(isReady)
.then((oled) => oled.turnOnDisplay() || oled)
.then(isReady)
.then((oled) => console.log('done'))
