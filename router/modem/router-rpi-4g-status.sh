#! /bin/sh

currentMinute="$(date +'%M')"

printf "modem status\n"
curl -m 3 'http://192.168.0.1/goform/goform_get_cmd_process?multi_data=1&isTest=false&sms_received_flag_flag=0&sts_received_flag_flag=0&cmd=date_month,modem_main_state,monthly_rx_bytes,monthly_time,monthly_tx_bytes,network_provider,network_type,pin_status,ppp_status,realtime_rx_bytes,realtime_time,realtime_tx_bytes,signalbar&' -H "Referer: http://192.168.0.1/index.html" | curl -H "Content-Type: application/json" -X PUT -d @- http://127.0.0.1:3000/gsm/status

printf "\nping status\n"
PR="$(ping -c 2 www.google.com | tail -1| awk -F '/' '{print $5}' | cut -f1 -d'.')"
curl -X PUT -d 'host=google&time='"$PR"'ms' http://localhost:3000/ping/status

printf "\ndata usage\n"
if [ $currentMinute == '05' ] || [ $currentMinute == '20' ] || [ $currentMinute == '45' ]; then
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
