#! /bin/sh

#modem status
# curl -m 3 'http://192.168.0.1/goform/goform_get_cmd_process?multi_data=1&isTest=false&sms_received_flag_flag=0&sts_received_flag_flag=0&cmd=pin_manage_result,pinnumber,puknumber,pin_status,domain_stat,network_provider,simcard_roam,prefer_dns_auto,standby_dns_auto,pin_manage_at_wait,wa_inner_version,hardware_version,imei,lac_code,cell_id,rssi,rscp,ecio,ppp_status,network_type,pin_puk_at_wait,wan_ipaddr,battery_status,dlginfo,station_num,station_mac,wifi_driver_reload_flag,signalbar,m_netselect_status,m_netselect_result,sms_unread_count,spn_display_flag,plmn_display_flag,spn_b1_flag,spn_b2_flag,spn_name_data,battery_pers,battery_charging,battery_value,msisdn,pbm_write_flag,locknum,sms_sim_capability_used,sms_nv_capability_used,pre_ppp_status,sm_cause,ussd_write_flag,ussd_write_flag_swiss,ussd_action,ussd_content,stk_write_flag,stk,stk_menu,wan_curr_tx_bytes,wan_curr_rx_bytes,wan_curr_conn_time,current_imsi_provider,sim_clear_all_flag,sim_iccid,sim_imsi,mexico_active_flag,rmcc,rmnc,pin_modify_or_save,check_apn_result,ussd_write_flag_msisdn,login_last_time,pin_puk_result,support_pbm_flag,sim_pay_type_o2,network_search,ipv6_wan_ipaddr,ipv6_prefer_dns_auto,ipv6_standby_dns_auto,user_ip_addr,user_login_timemark,mgmt_nvc_timemark,wifi_set_flags,ex_wifi_rssi,ex_wifi_status,EX_APLIST,lte_rssi,lte_rsrq,lte_rsrp,lte_snr,wan_csq,network_provider_fullname,hmcc,hmnc,hplmn_fullname,mdm_mcc,mdm_mnc,realtime_tx_bytes,realtime_rx_bytes,realtime_tx_thrpt,realtime_rx_thrpt,realtime_time,data_status,sleep_status,wps_pin,work_mode,peak_tx_bytes,peak_rx_bytes,mode_main_state,wispr_result,devui_get_sim_info,wan_network_status,wifi_profile_tmp,oled_test_status,ex_wifi_rssi_dbm,EX_APLIST1,scan_finish,fota_apn_flag,psw_fail_num_str,last_login_time,ssid2_stat,sta_ip_status,pbm_group,pbm_init_flag,dlna_rescan_end,modem_msn,manufacturer,model_name,upgrade_remind,sc,lte_pci,tx_power,enodeb_id,lte_band,redirect_flag,wan_rrc_state,wan_active_band,mgmt_open_url_for_auto_connect_flag,fota_check_result,fota_upgrade_result,dm_update_control_result,pbm_cur_index,pbm_load_complete,sms_current_db_id,sms_init,systime_mode,product_type,wan_auto_conn_prompt_flag,lan_netmask_for_current,sim_card_type,need_hard_reboot,wan_auto_reconnecting,ota_user_select,ota_manual_check_roam_state,ota_new_version_state_remind,datausage_sim_number,datausage_data_left,datausage_data_total,datausage_unit,datausage_current_status&' -H "Referer: http://192.168.0.1/index.html" | curl -H "Content-Type: application/json" -X PUT -d @- http://127.0.0.1:3000/gsm/status

#ping status
PR="$(ping -c 2 www.google.com | tail -1| awk -F '/' '{print $5}' | cut -f1 -d'.')"
curl -X PUT -d 'host=google&time='"$PR"'ms' http://localhost:3000/ping/status

#VPN Status
zz="$((
echo open 127.0.0.1 6001
sleep 1
echo state
sleep 1
echo exit
) | telnet)"
echo $zz
