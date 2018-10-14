const rc = require('rc');

module.exports = () => (rc('statsapp', {
    config: {
        env: 'dev',
        log: {level: 'info'},
        storage: {
            db: 'statuses'
        },
        modem: {
            repeatInterval: 20000
        },
        modemHealthCheck: {
            repeatInterval: 90000
        },
        internetProvider: {
            repeatInterval: 6000000,
            uri: 'http://data.vivacom.bg'
        },
        lcd: {
            addr: 0
        }
    }
}).config || {});
