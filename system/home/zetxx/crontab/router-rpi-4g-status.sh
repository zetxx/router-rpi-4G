#! /bin/sh

#printf "\nping status\n"
#PR="$(ping -c 2 www.google.com | tail -1| awk -F '/' '{print $5}' | cut -f1 -d'.')"
#curl -X POST --header 'Content-Type: application/json' --header 'Accept: application/json' -d '{"jsonrpc": "2.0","meta": {},"method": "stats.insert","params": {"type": "ping", "data": {"host": "google.com", "value": "'"$PR"'", "units": "ms"}}}' http://127.0.0.1:9004/JSONRPC/stats.insert

printf "\nvpn status\n"
#VPN Status
vpnStat="$((
echo open 127.0.0.1 6001
sleep 1
echo state
sleep 1
echo exit
) | telnet | base64 -w0)"
echo $vpnStat

#curl -X POST --header 'Content-Type: application/json' --header 'Accept: application/json' -d '{"jsonrpc": "2.0","meta": {},"method": "stats.insert","params": {"type": "vpn", "data": {"raw": "'"$vpnStat"'"}}}' http://127.0.0.1:9004/JSONRPC/stats.insert
printf "\n"

# connect if dissconected
curl -X POST -H "Referer: http://10.21.21.1/index.html" -H "Content-Type: application/x-www-form-urlencoded" -d "isTest=false&notCallback=true&goformId=CONNECT_NETWORK" http://10.21.21.1/goform/goform_set_cmd_process
