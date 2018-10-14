const req = require('request-promise');
const r = require('rethinkdb');
const log = require('../../log');

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
    flipConnection: ({uri, goformId}) => ({
        uri: `${uri}/goform/goform_set_cmd_process`,
        method: 'POST',
        headers: {
            Referer: uri,
            Origin: uri,
            'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'X-Requested-With': 'XMLHttpRequest',
            'Accept-Encoding': 'gzip, deflate'
        },
        form: {isTest: 'false', notCallback: 'true', goformId},
        json: true
    }),
    dataUsage: ({uri}) => ({
        uri,
        headers: {
            'Accept-Encoding': 'deflate'
        },
        transform: (b) => ({usedTotal: convertToBytes((b.match(/(percentage[^>]+>)([\d,\sa-z.]+)/ig)[1] || '').split('>').pop().trim())})
    })
};

const doRequest = (dbInst, {options, type}) => req(options)
    .then((res) =>
        res && r.table(type)
        .insert(Object.assign({insertTime: Date.now()}, res))
        .run(dbInst)
    )
    .then((resp) => log.trace(`client ${type}: `, resp));

const init = (type, dbInst, {uri, repeatInterval} = {}) => {
    const options = mappings[type]({uri});

    return () => setInterval(() => (doRequest(dbInst, {options, type})), repeatInterval) && log.trace(`http client init: ${type} with options: uri: ${uri}, repeatInterval: ${repeatInterval}`);
};

const levelCalc = (prev, cur, level) => ((prev === cur && level + 1) || level);

const warnLevel = (data) => {
    const dataLen = (data.length - 1);
    const warn = data.reduce((a, {realtimeRxBytes, realtimeTxBytes, pppStatus}, idx) => {
        if (!idx) {
            return Object.assign(a, {down: {prev: realtimeRxBytes, level: 0}, up: {prev: realtimeTxBytes, level: 0}, status: [pppStatus]});
        } else {
            return Object.assign(a, {
                down: {prev: realtimeRxBytes, level: levelCalc(a.down.prev, realtimeRxBytes, a.down.level)},
                up: {prev: realtimeTxBytes, level: levelCalc(a.up.prev, realtimeTxBytes, a.up.level)},
                status: a.status.concat([pppStatus])
            });
        }
    }, {});

    if (warn.down.level) {
        if (warn.down.level === warn.up.level) {
            return 'ok';
        } else if (warn.down.level === dataLen && warn.up.level < dataLen - 1) {
            if (!warn.status.filter((s) => s !== 'ppp_connected').length) {
                return 'reset';
            }
            return 'pending-reset';
        }
    }
    return 'ok';
};

const initModemHealthAction = (dbInst, {uri, repeatInterval} = {}) => {
    const q = r.table('gsm').orderBy(r.desc('insertTime')).limit(3);
    return () => setInterval(() => {
        log.trace('modem health check');
        q.run(dbInst)
            .then((data) =>
                Promise.resolve(log.trace(data.map(({insertTime, pppStatus, realtimeRxBytes, realtimeTxBytes}) => ({insertTime, pppStatus, realtimeRxBytes, realtimeTxBytes}))))
                    .then(() => warnLevel(data))
                    .then((command) => {
                        var mappingDisconnect = mappings.flipConnection({uri, goformId: 'DISCONNECT_NETWORK'});
                        var mappingConnect = mappings.flipConnection({uri, goformId: 'CONNECT_NETWORK'});
                        if (command === 'reset') {
                            log.info({command, data});
                            return req(mappingDisconnect)
                                .then((res) => log.info({command, disconnect: true, status: res}))
                                .then(() => req(mappingConnect))
                                .then((res) => log.info({command, connect: true, status: res}))
                                .catch((err) => log.error({command, err}));
                        }
                    })
            );
    }, repeatInterval);
};

module.exports = (dbInst, {modem, internetProvider, modemHealthCheck}) => Promise.resolve()
    .then(() => log.trace('clients init ...'))
    .then(init('gsm', dbInst, modem))
    .then(init('dataUsage', dbInst, internetProvider))
    .then(initModemHealthAction(dbInst, Object.assign({}, modemHealthCheck, {uri: modem.uri})));
