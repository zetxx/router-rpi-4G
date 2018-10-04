const Joi = require('joi');
const r = require('rethinkdb');

const dashToCamelCase = (c) => {
    if (c.dataValues) {
        var o = c.dataValues;
        return Object.keys(o).reduce((a, f) => {
            var newField = f.split('_').map((v, idx) => ((idx && v.split('').map((v2, idx2) => ((!idx2 && v2.toUpperCase()) || v2)).join('')) || v)).join('');
            a[newField] = o[f];
            return a;
        }, {});
    }
    return c;
};

module.exports = (server, dbInst) => (server.route({
    method: 'PUT',
    path: '/gsm/status',
    config: {
        description: 'populate modem setting',
        notes: 'populate modem setting',
        tags: ['api'],
        handler: (request, h) => (r
            .table('gsm')
            .insert(dashToCamelCase(request.payload || {}))
            .run(dbInst)
        ),
        validate: {
            payload: {
                total_tx_bytes: Joi.number().integer().positive().example(10),
                total_rx_bytes: Joi.number().integer().positive().example(10),
                pin_status: Joi.any(),
                domain_stat: Joi.any(),
                network_provider: Joi.any(),
                cell_id: Joi.any(),
                ppp_status: Joi.any(),
                network_type: Joi.any(),
                signalbar: Joi.any(),
                lte_rssi: Joi.any(),
                lte_rsrq: Joi.any(),
                lte_rsrp: Joi.any(),
                lte_snr: Joi.any(),
                realtime_tx_bytes: Joi.number().integer().positive().example(10),
                realtime_rx_bytes: Joi.number().integer().positive().example(10),
                realtime_time: Joi.any(),
                peak_tx_bytes: Joi.number().integer().positive().example(10),
                peak_rx_bytes: Joi.number().integer().positive().example(10),
                psw_fail_num_str: Joi.any(),
                tx_power: Joi.any(),
                enodeb_id: Joi.any(),
                lte_band: Joi.any(),
                sim_card_type: Joi.any()
            },
            failAction: (request, h, err) => ((err.isJoi && h.response(JSON.stringify(err && err.details)).code(400).takeover()) || h.response(err).takeover())
        }
    }
}));
