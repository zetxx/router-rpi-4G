const Factory = require('bridg-wrong-playground/factory.js');
const Service = Factory({state: true, service: true, api: {type: 'http'}, discovery: {type: 'dns'}, logger: {type: 'udp'}, external: {type: 'dummy'}});
const isOnline = require('is-online');

class OnlineChecker extends Service {
    initCron() {
        this.triggerEvent('isOnline', {});
        setInterval(() => this.triggerEvent('isOnline', {}), 60000);
    }
}

var netProvider = new OnlineChecker({name: 'onlineChecker'});
var onlineStatus = [];

netProvider.registerExternalMethod({
    method: 'event.isOnline',
    fn: function() {
        return isOnline();
    }
});

netProvider.registerExternalMethod({
    method: 'isOnline.response',
    fn: function(isOnline) {
        if (isOnline) {
            onlineStatus = [];
        }
        if (onlineStatus.length > 3) {
            this.request('modem.command.disconnect')
                .then(({result, error}) => {
                    return this.request('modem.command.connect');
                })
                .catch((e) => netProvider.log('error', e));
        } else {
            onlineStatus.push(Date.now());
        }
        return undefined;
    }
});

netProvider.start()
    .then(() => netProvider.initCron());
