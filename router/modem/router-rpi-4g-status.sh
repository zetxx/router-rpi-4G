#! /bin/sh

#modem status
curl -m 3 'http://192.168.0.1/goform/goform_get_cmd_process?multi_data=1&isTest=false&sms_received_flag_flag=0&sts_received_flag_flag=0&cmd=total_tx_bytes,total_rx_bytes,pin_status,domain_stat,network_provider,cell_id,ppp_status,network_type,signalbar,lte_rssi,lte_rsrq,lte_rsrp,lte_snr,realtime_tx_bytes,realtime_rx_bytes,realtime_time,peak_tx_bytes,peak_rx_bytes,psw_fail_num_str,tx_power,enodeb_id,lte_band,sim_card_type&' -H "Referer: http://192.168.0.1/index.html" | curl -H "Content-Type: application/json" -X PUT -d @- http://127.0.0.1:3000/gsm/status

#ping status
PR="$(ping -c 2 www.google.com | tail -1| awk -F '/' '{print $5}' | cut -f1 -d'.')"
curl -X PUT -d 'host=google&time='"$PR"'ms' http://localhost:3000/ping/status

#VPN Status
#zz="$((
#echo open 127.0.0.1 6001
#sleep 1
#echo state
#sleep 1
#echo exit
#) | telnet)"
#echo $zz
curl -X PUT -d 'active=true' http://localhost:3000/vpn/status
