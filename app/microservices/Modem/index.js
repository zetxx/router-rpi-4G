const rc = require('rc');
const pso = require('parse-strings-in-object');
const Factory = require('bridg-wrong-playground/factory.js');
const {fnThrowOrReturn} = require('../utils');
const discovery = (pso(rc('', {})).discovery === false && 'direct') || 'mdns';
const Service = Factory({state: true, service: true, api: {type: 'http'}, discovery: {type: discovery}, logger: {type: 'udp'}, external: {type: 'http'}});

const lodashToCamelCase = (obj) => {
    return pso(Object.keys(obj).reduce((a, c) => {
        return {
            ...a,
            [c.split('_').map((v, k) => ((k && ([v.slice(0, 1).toUpperCase(), v.slice(1)].join(''))) || v)).join('')]: obj[c]
        };
    }, {}));
};

class Modem extends Service {
    constructor(args) {
        super(args);
        this.setStore(
            ['config', 'modem'],
            pso(rc(this.getNodeName() || 'buzzer', {
                modem: {
                    level: 'trace',
                    uri: 'http://127.0.0.1',
                    triggerEventTimeout: 30000 // 30 sec
                }
            }).modem)
        );
    }

    initCron() {
        let triggerEventTimeout = service.getStore(['config', 'modem', 'triggerEventTimeout']);
        this.triggerEvent('stats', {});
        setInterval(() => this.triggerEvent('stats', {}), triggerEventTimeout);
    }
}

var service = new Modem({name: 'modem'});

service.registerExternalMethod({
    method: 'event.stats',
    fn: function() {
        return {
            uri: `${service.getStore(['config', 'modem', 'uri'])}/goform/goform_get_cmd_process`,
            headers: {
                Referer: `${service.getStore(['config', 'modem', 'uri'])}`
            },
            qs: {
                isTest: 'false',
                multi_data: '1',
                cmd: ['modem_main_state', 'pin_status', 'loginfo', 'new_version_state', 'current_upgrade_state', 'is_mandatory', 'signalbar', 'network_type', 'network_provider', 'ppp_status', 'simcard_roam', 'lan_ipaddr', 'spn_display_flag', 'plmn_display_flag', 'spn_name_data', 'spn_b1_flag', 'spn_b2_flag', 'realtime_tx_bytes', 'realtime_rx_bytes', 'realtime_time', 'realtime_tx_thrpt', 'realtime_rx_thrpt', 'monthly_rx_bytes', 'monthly_tx_bytes', 'monthly_time', 'date_month', 'data_volume_limit_switch', 'roam_setting_option', 'upg_roam_switch', 'sms_received_flag', 'sms_unread_num', 'imei', 'web_version', 'wa_inner_version', 'hardware_version', 'LocalDomain', 'wan_ipaddr', 'ipv6_pdp_type', 'pdp_type', 'lte_rsrp'].join(',')
            },
            json: true
        };
    }
});

service.registerExternalMethod({
    method: 'stats.response',
    fn: function({result, error: {error} = {}}) {
        (result && this.notification('storage.stats.insert', {type: 'modem', data: lodashToCamelCase(result)}));
        (error && this.notification('storage.stats.insert', {type: 'modem', data: {error: {code: error.code}}}));
        return undefined;
    }
});

service.registerApiMethod({
    method: 'command.disconnect',
    direction: 'in',
    fn: function() {
        return {
            uri: `${service.getStore(['config', 'modem', 'uri'])}/goform/goform_set_cmd_process`,
            headers: {
                Referer: `${service.getStore(['config', 'modem', 'uri'])}`,
                'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'Accept-Encoding': 'gzip, deflate'
            },
            method: 'POST',
            form: {isTest: 'false', notCallback: 'true', goformId: 'DISCONNECT_NETWORK'},
            json: true
        };
    }
});

service.registerApiMethod({
    method: 'command.disconnect',
    direction: 'out',
    fn: fnThrowOrReturn
});

service.registerExternalMethod({
    method: 'command.disconnect',
    fn: fnThrowOrReturn
});

service.registerApiMethod({
    method: 'command.connect',
    direction: 'in',
    fn: function() {
        return {
            uri: `${service.getStore(['config', 'modem', 'uri'])}/goform/goform_set_cmd_process`,
            headers: {
                Referer: `${service.getStore(['config', 'modem', 'uri'])}`,
                'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'Accept-Encoding': 'gzip, deflate'
            },
            method: 'POST',
            form: {isTest: 'false', notCallback: 'true', goformId: 'CONNECT_NETWORK'},
            json: true
        };
    }
});

service.registerApiMethod({
    method: 'command.connect',
    direction: 'out',
    fn: fnThrowOrReturn
});

service.registerExternalMethod({
    method: 'command.connect',
    fn: fnThrowOrReturn
});

service.start()
    .then(() => service.initCron())
    .catch((e) => service.log('error', {in: 'modem.ready', error: e}));
