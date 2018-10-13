const rc = require('rc');

module.exports = () => (rc('statsapp', {
    config: {
        env: 'dev',
        modem: {
            repeatInterval: 300000
        },
        internetProvider: {
            repeatInterval: 600000,
            uri: 'http://data.vivacom.bg'
        }
    }
}).config || {});
