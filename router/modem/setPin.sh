#! /bin/sh

while true; do
  if curl -m 2 http://192.168.0.1/index.html | grep --quiet "{" ; then
    echo "online"
    sleep 10
    ## PIN
    curl -X POST \
    -d "isTest=false&goformId=ENTER_PIN&PinNumber=0000" \
    -H "Content-Type: application/x-www-form-urlencoded; charset=UTF-8" \
    -H "X-Requested-With: XMLHttpRequest" \
    -H "Origin: http://192.168.0.1" \
    -H "Referer: http://192.168.0.1/index.html" \
    http://192.168.0.1/goform/goform_set_cmd_process
    sleep 1
    ## MODE
    curl -X POST \
    -d "goformId=SET_BEARER_PREFERENCE&BearerPreference=WCDMA_AND_LTE" \
    -H "Content-Type: application/x-www-form-urlencoded; charset=UTF-8" \
    -H "X-Requested-With: XMLHttpRequest" \
    -H "Origin: http://192.168.0.1" \
    -H "Referer: http://192.168.0.1/index.html" \
    http://192.168.0.1/goform/goform_set_cmd_process
    break
  else
    echo "waiting 5 sec"
    sleep 5
  fi
done

## AUTO CONNECT
#curl -X POST \
#-d "goformId=SET_CONNECTION_MODE&ConnectionMode=auto_dial" \
#-H "Content-Type: application/x-www-form-urlencoded; charset=UTF-8" \
#-H "X-Requested-With: XMLHttpRequest" \
#-H "Origin: http://192.168.0.1" \
#-H "Referer: http://192.168.0.1/index.html" \
#http://192.168.0.1/goform/goform_set_cmd_process
## STATUS
#curl -m 3 'http://192.168.0.1/goform/goform_get_cmd_process?multi_data=1&isTest=false&sms_received_flag_flag=0&sts_received_flag_flag=0&cmd=modem_main_state,pin_status,loginfo,new_version_state,current_upgrade_state,is_mandatory,signalbar,network_type,network_provider,ppp_status,EX_SSID1,sta_ip_status,EX_wifi_profile,m_ssid_enable,RadioOff,simcard_roam,lan_ipaddr,station_mac,battery_charging,battery_vol_percent,battery_pers,spn_display_flag,plmn_display_flag,spn_name_data,spn_b1_flag,spn_b2_flag,realtime_tx_bytes,realtime_rx_bytes,realtime_time,realtime_tx_thrpt,realtime_rx_thrpt,monthly_rx_bytes,monthly_tx_bytes,monthly_time,date_month,data_volume_limit_switch,data_volume_limit_size,data_volume_alert_percent,data_volume_limit_unit,roam_setting_option,upg_roam_switch,ap_station_mode,sms_received_flag,sts_received_flag,sms_unread_num&' -H "Referer: http://192.168.0.1/index.html"
