const rc = require('rc');
const Factory = require('bridg-wrong-playground/factory.js');
const Service = Factory({state: true, api: {type: 'udp'}, discovery: {type: 'dns'}});
const pso = require('parse-strings-in-object');

const selfLog = false;

class LoggerConsumer extends Service {
    constructor(args) {
        super(args);
        this.setStore(
            ['config', 'log'],
            pso(rc(this.getNodeName() || 'buzzer', {
                log: {
                    level: 'trace'
                }
            }).log)
        );
        this.logger = require('pino')({
            prettyPrint: {colorize: true},
            level: this.getStore(['config', 'log', 'level'])
        });
        this.dbLogger = false;
        this.dbLoggerQueue = [];
    }

    log(level, message) {
        var lvl = level || 'trace';
        const toBeLogged = Object.assign({pid: `${this.name}.${this.domain}`, logLevel: lvl, domain: this.domain, timestamp: Date.now()}, message);
        if (!selfLog && (`${this.name}.${this.domain}` === message.pid || !message.pid)) {
            return Promise.resolve({});
        }
        this.logger[lvl](Object.assign({}, toBeLogged));
        return Promise.resolve({});
    }
}

var loggerConsumer = new LoggerConsumer({name: 'logger'});

loggerConsumer.registerApiMethod({
    method: 'log',
    direction: 'in',
    fn: function({level = 'trace', fingerPrint, ...rest}) {
        try {
            loggerConsumer.log(level, {pid: `${fingerPrint.nodeName}`, ...rest});
        } catch (e) {}
        return {};
    }
});
loggerConsumer.start();
