const Joi = require('joi');
const getGsmStatusModel = require('../../../db/models/gsmStatus');

module.exports = (server, sequelize) => (server.route({
    method: 'PUT',
    path: '/gsm/status',
    config: {
        description: 'populate modem setting',
        notes: 'populate modem setting',
        tags: ['api'],
        handler: (request, h) => {
            return getGsmStatusModel()
                .create(request.payload)
                .then(() => request.payload);
        },
        validate: {
            payload: {
                total_tx_bytes: Joi.any(),
                total_rx_bytes: Joi.any(),
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
                realtime_tx_bytes: Joi.any(),
                realtime_rx_bytes: Joi.any(),
                realtime_time: Joi.any(),
                peak_tx_bytes: Joi.any(),
                peak_rx_bytes: Joi.any(),
                psw_fail_num_str: Joi.any(),
                tx_power: Joi.any(),
                enodeb_id: Joi.any(),
                lte_band: Joi.any(),
                sim_card_type: Joi.any()
            }
        }
    }
}));
