#! /bin/sh

currentMinute="$(date +'%M')"

printf "modem status\n"
curl -m 3 'http://10.21.21.1/goform/goform_get_cmd_process?isTest=false&multi_data=1&cmd=modem_main_state,pin_status,loginfo,new_version_state,current_upgrade_state,is_mandatory,signalbar,network_type,network_provider,ppp_status,simcard_roam,lan_ipaddr,spn_display_flag,plmn_display_flag,spn_name_data,spn_b1_flag,spn_b2_flag,realtime_tx_bytes,realtime_rx_bytes,realtime_time,realtime_tx_thrpt,realtime_rx_thrpt,monthly_rx_bytes,monthly_tx_bytes,monthly_time,date_month,data_volume_limit_switch,roam_setting_option,upg_roam_switch,sms_received_flag,sms_unread_num,imei,web_version,wa_inner_version,hardware_version,LocalDomain,wan_ipaddr,ipv6_pdp_type,pdp_type,lte_rsrp' -H "Referer: http://10.21.21.1/index.html" | curl -H "Content-Type: application/json" -X PUT -d @- http://127.0.0.1:3000/gsm/status

printf "\nping status\n"
PR="$(ping -c 2 www.google.com | tail -1| awk -F '/' '{print $5}' | cut -f1 -d'.')"
curl -X PUT -d 'host=google&time='"$PR"'ms' http://localhost:3000/ping/status

if [ $currentMinute == '05' ] || [ $currentMinute == '20' ] || [ $currentMinute == '45' ]; then
    printf "\ndata usage\n"
    traffic="$(curl http://data.vivacom.bg | grep 'loader-bar' | grep 'percentage' | egrep -o '>[0-9]+[^(]+' | cut -d '>' -f 2)"
    curl -X PUT -d 'raw='"$traffic" http://localhost:3000/data/usage
fi

printf "\nvpn status\n"
#VPN Status
vpnStat="$((
echo open 127.0.0.1 6001
sleep 1
echo state
sleep 1
echo exit
) | telnet)"
echo $vpnStat

curl -X PUT -d "raw=$vpnStat" http://localhost:3000/vpn/status
printf "\n"
