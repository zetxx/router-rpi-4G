#! /bin/sh

#modem status
# curl -m 3 'http://192.168.0.1/goform/goform_get_cmd_process?multi_data=1&isTest=false&sms_received_flag_flag=0&sts_received_flag_flag=0&cmd=modem_main_state,pin_status,loginfo,new_version_state,current_upgrade_state,is_mandatory,signalbar,network_type,network_provider,ppp_status,EX_SSID1,sta_ip_status,EX_wifi_profile,m_ssid_enable,RadioOff,simcard_roam,lan_ipaddr,station_mac,battery_charging,battery_vol_percent,battery_pers,spn_display_flag,plmn_display_flag,spn_name_data,spn_b1_flag,spn_b2_flag,realtime_tx_bytes,realtime_rx_bytes,realtime_time,realtime_tx_thrpt,realtime_rx_thrpt,monthly_rx_bytes,monthly_tx_bytes,monthly_time,date_month,data_volume_limit_switch,data_volume_limit_size,data_volume_alert_percent,data_volume_limit_unit,roam_setting_option,upg_roam_switch,ap_station_mode,sms_received_flag,sts_received_flag,sms_unread_num&' -H "Referer: http://192.168.0.1/index.html" | curl -H "Content-Type: application/json" -X POST -d @- http://localhost:3000/gsm/status

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