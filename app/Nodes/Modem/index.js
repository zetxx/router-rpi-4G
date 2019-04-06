const rc = require('rc');
const Factory = require('bridg-wrong-playground/factory.js');
const Service = Factory({state: true, service: true, api: {type: 'http'}, discovery: {type: 'dns'}, logger: {type: 'udp'}, external: {type: 'http'}});
const pso = require('parse-strings-in-object');

class Modem extends Service {
    constructor(args) {
        super(args);
        this.setStore(
            ['config', 'modem'],
            pso(rc(this.getNodeName() || 'buzzer', {
                modem: {
                    level: 'trace',
                    endpoints: {
                        modem: {
                            uri: 'http://127.0.0.1',
                            proto: 'http'
                        },
                        provider: {
                            uri: 'http://127.0.0.1',
                            proto: 'http'
                        }
                    }
                }
            }).modem)
        );
    }

    initCron() {
        setTimeout(() => this.triggerEvent('modem.stats', {}), 1000);
    }
}

var modem = new Modem({name: 'modem'});

modem.registerExternalMethod({
    method: 'event.modem.stats',
    fn: function() {
        modem;
        return {
            uri: `${modem.getStore(['config', 'modem', 'endpoints', 'modem', 'proto'])}://${modem.getStore(['config', 'modem', 'endpoints', 'modem', 'uri'])}/goform/goform_get_cmd_process`,
            headers: {
                Referer: `${modem.getStore(['config', 'modem', 'endpoints', 'modem', 'proto'])}://${modem.getStore(['config', 'modem', 'endpoints', 'modem', 'uri'])}`
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

modem.start()
    .then(() => modem.initCron());
