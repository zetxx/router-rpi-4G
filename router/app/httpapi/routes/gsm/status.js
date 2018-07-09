const Joi = require('joi');
const getGsmStatusModel = require('../../../db/models/gsmStatus');

module.exports = (server, sequelize) => (server.route({
    method: 'PUT',
    path: '/gsm/status',
    config: {
        description: 'populate modem setting',
        notes: 'populate modem setting',
        tags: ['api'], // ADD THIS TAG
        handler: (request, h) => {
            return getGsmStatusModel()
                .create(request.payload)
                .then(() => request.payload);
        },
        validate: {
            payload: {
                pin_manage_result: Joi.any(),
                pinnumber: Joi.any(),
                puknumber: Joi.any(),
                pin_status: Joi.any(),
                domain_stat: Joi.any(),
                network_provider: Joi.any(),
                simcard_roam: Joi.any(),
                prefer_dns_auto: Joi.any(),
                standby_dns_auto: Joi.any(),
                pin_manage_at_wait: Joi.any(),
                wa_inner_version: Joi.any(),
                hardware_version: Joi.any(),
                imei: Joi.any(),
                lac_code: Joi.any(),
                cell_id: Joi.any(),
                rssi: Joi.any(),
                rscp: Joi.any(),
                ecio: Joi.any(),
                ppp_status: Joi.any(),
                network_type: Joi.any(),
                pin_puk_at_wait: Joi.any(),
                wan_ipaddr: Joi.any(),
                battery_status: Joi.any(),
                dlginfo: Joi.any(),
                station_num: Joi.any(),
                station_mac: Joi.any(),
                wifi_driver_reload_flag: Joi.any(),
                signalbar: Joi.any(),
                m_netselect_status: Joi.any(),
                m_netselect_result: Joi.any(),
                sms_unread_count: Joi.any(),
                spn_display_flag: Joi.any(),
                plmn_display_flag: Joi.any(),
                spn_b1_flag: Joi.any(),
                spn_b2_flag: Joi.any(),
                spn_name_data: Joi.any(),
                battery_pers: Joi.any(),
                battery_charging: Joi.any(),
                battery_value: Joi.any(),
                msisdn: Joi.any(),
                pbm_write_flag: Joi.any(),
                locknum: Joi.any(),
                sms_sim_capability_used: Joi.any(),
                sms_nv_capability_used: Joi.any(),
                pre_ppp_status: Joi.any(),
                sm_cause: Joi.any(),
                ussd_write_flag: Joi.any(),
                ussd_write_flag_swiss: Joi.any(),
                ussd_action: Joi.any(),
                ussd_content: Joi.any(),
                stk_write_flag: Joi.any(),
                stk: Joi.any(),
                stk_menu: Joi.any(),
                wan_curr_tx_bytes: Joi.any(),
                wan_curr_rx_bytes: Joi.any(),
                wan_curr_conn_time: Joi.any(),
                current_imsi_provider: Joi.any(),
                sim_clear_all_flag: Joi.any(),
                hplmn: Joi.any(),
                sim_iccid: Joi.any(),
                sim_imsi: Joi.any(),
                mexico_active_flag: Joi.any(),
                rmcc: Joi.any(),
                rmnc: Joi.any(),
                pin_modify_or_save: Joi.any(),
                check_apn_result: Joi.any(),
                ussd_write_flag_msisdn: Joi.any(),
                login_last_time: Joi.any(),
                pin_puk_result: Joi.any(),
                support_pbm_flag: Joi.any(),
                sim_pay_type_o2: Joi.any(),
                network_search: Joi.any(),
                ipv6_wan_ipaddr: Joi.any(),
                ipv6_prefer_dns_auto: Joi.any(),
                ipv6_standby_dns_auto: Joi.any(),
                user_ip_addr: Joi.any(),
                user_login_timemark: Joi.any(),
                mgmt_nvc_timemark: Joi.any(),
                wifi_set_flags: Joi.any(),
                ex_wifi_rssi: Joi.any(),
                ex_wifi_status: Joi.any(),
                EX_APLIST: Joi.any(),
                lte_rssi: Joi.any(),
                lte_rsrq: Joi.any(),
                lte_rsrp: Joi.any(),
                lte_snr: Joi.any(),
                wan_csq: Joi.any(),
                network_provider_fullname: Joi.any(),
                hmcc: Joi.any(),
                hmnc: Joi.any(),
                hplmn_fullname: Joi.any(),
                mdm_mcc: Joi.any(),
                mdm_mnc: Joi.any(),
                realtime_tx_bytes: Joi.any(),
                realtime_rx_bytes: Joi.any(),
                realtime_tx_thrpt: Joi.any(),
                realtime_rx_thrpt: Joi.any(),
                realtime_time: Joi.any(),
                data_status: Joi.any(),
                sleep_status: Joi.any(),
                wps_pin: Joi.any(),
                work_mode: Joi.any(),
                peak_tx_bytes: Joi.any(),
                peak_rx_bytes: Joi.any(),
                mode_main_state: Joi.any(),
                wispr_result: Joi.any(),
                devui_get_sim_info: Joi.any(),
                wan_network_status: Joi.any(),
                wifi_profile_tmp: Joi.any(),
                oled_test_status: Joi.any(),
                ex_wifi_rssi_dbm: Joi.any(),
                EX_APLIST1: Joi.any(),
                scan_finish: Joi.any(),
                fota_apn_flag: Joi.any(),
                psw_fail_num_str: Joi.any(),
                last_login_time: Joi.any(),
                ssid2_stat: Joi.any(),
                sta_ip_status: Joi.any(),
                pbm_group: Joi.any(),
                pbm_init_flag: Joi.any(),
                dlna_rescan_end: Joi.any(),
                modem_msn: Joi.any(),
                manufacturer: Joi.any(),
                model_name: Joi.any(),
                upgrade_remind: Joi.any(),
                sc: Joi.any(),
                lte_pci: Joi.any(),
                tx_power: Joi.any(),
                enodeb_id: Joi.any(),
                lte_band: Joi.any(),
                redirect_flag: Joi.any(),
                wan_rrc_state: Joi.any(),
                wan_active_band: Joi.any(),
                mgmt_open_url_for_auto_connect_flag: Joi.any(),
                fota_check_result: Joi.any(),
                fota_upgrade_result: Joi.any(),
                dm_update_control_result: Joi.any(),
                pbm_cur_index: Joi.any(),
                pbm_load: Joi.any(),
                pbm_load_compl: Joi.any()
            }
        }
    }
}));
