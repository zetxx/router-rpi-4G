const rc = require('rc');
const Factory = require('bridg-wrong-playground/factory.js');
const Service = Factory({state: true, api: {type: 'http'}, discovery: {type: 'dns'}, logger: {type: 'udp'}});
const pso = require('parse-strings-in-object');

class Modem extends Service {
    constructor(args) {
        super(args);
        this.setStore(
            ['config', 'modem'],
            pso(rc(this.getNodeName() || 'buzzer', {
                modem: {
                    level: 'trace'
                }
            }).modem)
        );
    }
}

var modem = new Modem({name: 'modem'});

modem.start();
