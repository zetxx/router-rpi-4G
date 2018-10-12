#! /bin/sh

printf "\nping status\n"
PR="$(ping -c 2 www.google.com | tail -1| awk -F '/' '{print $5}' | cut -f1 -d'.')"
curl -X PUT -d 'host=google&time='"$PR"'ms' http://localhost:3000/ping/status

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
