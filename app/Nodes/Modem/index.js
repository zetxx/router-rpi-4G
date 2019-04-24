const rc = require('rc');
const Factory = require('bridg-wrong-playground/factory.js');
const Service = Factory({state: true, service: true, api: {type: 'http'}, discovery: {type: 'dns'}, logger: {type: 'udp'}, external: {type: 'http'}});
const pso = require('parse-strings-in-object');

const fnThrowOrReturn = function({result, error}) {
    if (error) {
        throw error;
    }
    return result;
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
                    triggerEventTimeout: 600000 // 10 min
                }
            }).modem)
        );
    }

    initCron() {
        setInterval(() => this.triggerEvent('stats', {}), modem.getStore(['config', 'modem', 'triggerEventTimeout']));
    }
}

var modem = new Modem({name: 'modem'});

modem.registerExternalMethod({
    method: 'event.stats',
    fn: function() {
        return {
            uri: `${modem.getStore(['config', 'modem', 'uri'])}/goform/goform_get_cmd_process`,
            headers: {
                Referer: `${modem.getStore(['config', 'modem', 'uri'])}`
            },
            method: 'POST',
            qs: {
                isTest: 'false',
                multi_data: '1',
                cmd: ['modem_main_state', 'pin_status', 'loginfo', 'new_version_state', 'current_upgrade_state', 'is_mandatory', 'signalbar', 'network_type', 'network_provider', 'ppp_status', 'simcard_roam', 'lan_ipaddr', 'spn_display_flag', 'plmn_display_flag', 'spn_name_data', 'spn_b1_flag', 'spn_b2_flag', 'realtime_tx_bytes', 'realtime_rx_bytes', 'realtime_time', 'realtime_tx_thrpt', 'realtime_rx_thrpt', 'monthly_rx_bytes', 'monthly_tx_bytes', 'monthly_time', 'date_month', 'data_volume_limit_switch', 'roam_setting_option', 'upg_roam_switch', 'sms_received_flag', 'sms_unread_num', 'imei', 'web_version', 'wa_inner_version', 'hardware_version', 'LocalDomain', 'wan_ipaddr', 'ipv6_pdp_type', 'pdp_type', 'lte_rsrp'].join(',')
            },
            json: true
        };
    }
});

modem.registerExternalMethod({
    method: 'stats.response',
    fn: function({result, error}) {
        (result && this.notification('storage.stats.insert', {type: 'modem', data: result}));
        return undefined;
    }
});

modem.registerApiMethod({
    method: 'command.disconnect',
    direction: 'in',
    fn: function() {
        return {
            uri: `${modem.getStore(['config', 'modem', 'uri'])}/goform/goform_get_cmd_process`,
            headers: {
                Referer: `${modem.getStore(['config', 'modem', 'uri'])}`,
                'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'X-Requested-With': 'XMLHttpRequest',
                'Accept-Encoding': 'gzip, deflate'
            },
            method: 'POST',
            form: {isTest: 'false', notCallback: 'true', goformId: 'DISCONNECT_NETWORK'},
            json: true
        };
    }
});

modem.registerApiMethod({
    method: 'command.disconnect',
    direction: 'out',
    fn: fnThrowOrReturn
});

modem.registerExternalMethod({
    method: 'command.disconnect',
    fn: fnThrowOrReturn
});

modem.registerApiMethod({
    method: 'command.connect',
    direction: 'in',
    fn: function() {
        return {
            uri: `${modem.getStore(['config', 'modem', 'uri'])}/goform/goform_get_cmd_process`,
            headers: {
                Referer: `${modem.getStore(['config', 'modem', 'uri'])}`,
                'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'X-Requested-With': 'XMLHttpRequest',
                'Accept-Encoding': 'gzip, deflate'
            },
            method: 'POST',
            form: {isTest: 'false', notCallback: 'true', goformId: 'CONNECT_NETWORK'},
            json: true
        };
    }
});

modem.registerApiMethod({
    method: 'command.connect',
    direction: 'out',
    fn: fnThrowOrReturn
});

modem.registerExternalMethod({
    method: 'command.connect',
    fn: fnThrowOrReturn
});

modem.start()
    .then(() => modem.initCron());
