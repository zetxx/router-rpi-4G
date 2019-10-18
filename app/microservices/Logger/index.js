const Logger = require('bridg-wrong-playground/predefined/Logger');
var service = new Logger({name: 'logger'});
service.start()
    .catch((e) => service.log('error', {in: 'logger.ready', error: e}));
