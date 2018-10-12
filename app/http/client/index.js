const req = require('request-promise');
const r = require('rethinkdb');

const dataTypeList = ['b', 'kb', 'mb', 'gb', 'tb'];

const convertToBytes = (content) => {
    var arr = content.toLowerCase().split(',').join('').split(' ') || [];
    var dataUsedRaw = arr.shift();
    var dataType = dataTypeList.indexOf(arr.pop());
    var dataUsed = 0;
    if (dataType >= 0) {
        dataUsed = ((!isNaN(parseFloat(dataUsedRaw)) && parseFloat(dataUsedRaw)) || 0) * Math.pow(1024, dataType);
    }
    return dataUsed;
};

const transform = (o) => {
    return Object.keys(o).reduce((a, f) => {
        var newField = f.split('_').map((v, idx) => ((idx && v.split('').map((v2, idx2) => ((!idx2 && v2.toUpperCase()) || v2)).join('')) || v)).join('');
        a[newField] = o[f];
        return a;
    }, {});
};

const mappings = {
    gsm: ({uri}) => ({
        uri: `${uri}/goform/goform_get_cmd_process`,
        headers: {
            Referer: uri
        },
        qs: {
            isTest: 'false',
            multi_data: '1',
            cmd: ['modem_main_state', 'pin_status', 'loginfo', 'new_version_state', 'current_upgrade_state', 'is_mandatory', 'signalbar', 'network_type', 'network_provider', 'ppp_status', 'simcard_roam', 'lan_ipaddr', 'spn_display_flag', 'plmn_display_flag', 'spn_name_data', 'spn_b1_flag', 'spn_b2_flag', 'realtime_tx_bytes', 'realtime_rx_bytes', 'realtime_time', 'realtime_tx_thrpt', 'realtime_rx_thrpt', 'monthly_rx_bytes', 'monthly_tx_bytes', 'monthly_time', 'date_month', 'data_volume_limit_switch', 'roam_setting_option', 'upg_roam_switch', 'sms_received_flag', 'sms_unread_num', 'imei', 'web_version', 'wa_inner_version', 'hardware_version', 'LocalDomain', 'wan_ipaddr', 'ipv6_pdp_type', 'pdp_type', 'lte_rsrp'].join(',')
        },
        json: true,
        transform
    }),
    dataUsage: () => ({
        uri: 'http://data.vivacom.bg',
        transform: (b) => ({usedTotal: convertToBytes((b.match(/(percentage[^>]+>)([\d,\sa-z.]+)/ig)[1] || '').split('>').pop().trim())})
    })
};

const init = (type, dbInst, {uri, repeatInterval} = {}) => {
    const options = mappings[type]({uri});

    return () => setInterval(() => (
        req(options)
            .then((res) =>
                res && r.table(type)
                .insert(Object.assign({insertTime: Date.now()}, res))
                .run(dbInst)
            )
    ), 5000);
};

module.exports = ({dbInst, modemUrl}) => {
    return Promise.resolve()
        .then(init('gsm', dbInst, {uri: modemUrl, repeatInterval: 300000}))
        .then(init('dataUsage', dbInst, {repeatInterval: 6000000}));
};
