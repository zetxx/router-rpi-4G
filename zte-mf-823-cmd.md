pin_manage_result  
pinnumber  
puknumber  
pin_status  
domain_stat  
network_provider  
simcard_roam  
prefer_dns_auto  
standby_dns_auto  
pin_manage_at_wait  
wa_inner_version  
hardware_version  
imei  
lac_code  
cell_id  
rssi  
rscp  
ecio  
ppp_status  
network_type  
pin_puk_at_wait  
wan_ipaddr  
battery_status  
dlginfo  
station_num  
station_mac  
wifi_driver_reload_flag  
signalbar  
m_netselect_status  
m_netselect_result  
sms_unread_count  
spn_display_flag  
plmn_display_flag  
spn_b1_flag  
spn_b2_flag  
spn_name_data  
battery_pers  
battery_charging  
battery_value  
msisdn  
pbm_write_flag  
locknum  
sms_sim_capability_used  
sms_nv_capability_used  
pre_ppp_status  
sm_cause  
ussd_write_flag  
ussd_write_flag_swiss  
ussd_action  
ussd_content  
stk_write_flag  
stk  
stk_menu  
wan_curr_tx_bytes  
wan_curr_rx_bytes  
wan_curr_conn_time  
current_imsi_provider  
sim_clear_all_flag  
hplmn  
sim_iccid  
sim_imsi  
mexico_active_flag  
rmcc  
rmnc  
pin_modify_or_save  
check_apn_result  
ussd_write_flag_msisdn  
login_last_time  
pin_puk_result  
support_pbm_flag  
sim_pay_type_o2  
network_search  
ipv6_wan_ipaddr  
ipv6_prefer_dns_auto  
ipv6_standby_dns_auto  
user_ip_addr  
user_login_timemark  
mgmt_nvc_timemark  
wifi_set_flags  
ex_wifi_rssi  
ex_wifi_status  
EX_APLIST  
lte_rssi  
lte_rsrq  
lte_rsrp  
lte_snr  
wan_csq  
network_provider_fullname  
hmcc  
hmnc  
hplmn_fullname  
mdm_mcc  
mdm_mnc  
realtime_tx_bytes  
realtime_rx_bytes  
realtime_tx_thrpt  
realtime_rx_thrpt  
realtime_time  
data_status  
sleep_status  
wps_pin  
work_mode  
peak_tx_bytes  
peak_rx_bytes  
mode_main_state  
wispr_result  
devui_get_sim_info  
wan_network_status  
wifi_profile_tmp  
oled_test_status  
ex_wifi_rssi_dbm  
EX_APLIST1  
scan_finish  
fota_apn_flag  
psw_fail_num_str  
last_login_time  
ssid2_stat  
sta_ip_status  
pbm_group  
pbm_init_flag  
dlna_rescan_end  
modem_msn  
manufacturer  
model_name  
upgrade_remind  
sc  
lte_pci  
tx_power  
enodeb_id  
lte_band  
redirect_flag  
wan_rrc_state  
wan_active_band  
mgmt_open_url_for_auto_connect_flag  
fota_check_result  
fota_upgrade_result  
dm_update_control_result  
pbm_cur_index  
pbm_load_complete  
sms_current_db_id  
sms_init  
systime_mode  
product_type  
wan_auto_conn_prompt_flag  
lan_netmask_for_current  
sim_card_type  
need_hard_reboot  
wan_auto_reconnecting  
ota_user_select  
ota_manual_check_roam_state  
ota_new_version_state_remind  
datausage_sim_number  
datausage_data_left  
datausage_data_total  
datausage_unit  
datausage_current_status  

## lock lte band

http://192.168.0.1/goform/goform_set_cmd_process?goformId=SET_LTE_BAND_LOCK&lte_band_lock=VAL

- VAL = 1800M
- VAL = 2600M
- VAL = 900M
- VAL = 800M
- VAL = all

## web modeswitch

http://192...../goform/goform_set_cmd_process?goformId=USB_MODE_SWITCH&usb_mode=N  

MSD - USB Mass Storage Device

- N=0 - PID = 0016: ZTE download mode. AT +ZCDRUN=E.
- N=1 - PID = 1125: MSD AT +ZCDRUN=9
- N=2 - PID = 2004: ?.
- N=3 - PID = 1403: RNDIS + MSD AT +ZCDRUN=8
- N=4 - PID = 1403: > N=3.
- N=5 - PID = 1405: > N=3, +CDC/ECM -RNDIS
- N=6 - PID = 1404: RNDIS + diagnostic port + 2 command ports + MSD + ADB (MF8230ZTED010000).
- N=7 - PID = 1244: CDC + diagnostic port + 2 command ports + MSD + ADB (MF8230ZTED010000).
- N=8 - PID = 1402: diagnostic port + 2 command ports + WWAN + MSD + ADB (1234567890ABCDEF).
- N=9 - PID = 9994: MBIM + diagnostic port + 2 command ports + ADB (1234567890ABCDEF).
