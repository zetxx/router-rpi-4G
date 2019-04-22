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

netProvider.registerExternalMethod({
    method: 'event.isOnline',
    fn: function() {
        return isOnline();
    }
});

netProvider.registerExternalMethod({
    method: 'isOnline.response',
    fn: function(response) {
        // do soemthing with the response
        return undefined;
    }
});

netProvider.start()
    .then(() => netProvider.initCron());
