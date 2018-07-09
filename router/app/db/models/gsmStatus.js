const Sequelize = require('sequelize');
var table;

module.exports = (sequelize) => (
    table ||
    (table = sequelize.define('gsm.status', {
        total_tx_bytes: Sequelize.STRING,
        total_rx_bytes: Sequelize.STRING,
        pin_status: Sequelize.STRING,
        domain_stat: Sequelize.STRING,
        network_provider: Sequelize.STRING,
        cell_id: Sequelize.STRING,
        ppp_status: Sequelize.STRING,
        network_type: Sequelize.STRING,
        signalbar: Sequelize.STRING,
        lte_rssi: Sequelize.STRING,
        lte_rsrq: Sequelize.STRING,
        lte_rsrp: Sequelize.STRING,
        lte_snr: Sequelize.STRING,
        realtime_tx_bytes: Sequelize.STRING,
        realtime_rx_bytes: Sequelize.STRING,
        realtime_time: Sequelize.STRING,
        peak_tx_bytes: Sequelize.STRING,
        peak_rx_bytes: Sequelize.STRING,
        psw_fail_num_str: Sequelize.STRING,
        tx_power: Sequelize.STRING,
        enodeb_id: Sequelize.STRING,
        lte_band: Sequelize.STRING,
        sim_card_type: Sequelize.STRING
    })) &&
    table
);
