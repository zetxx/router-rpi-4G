#! /bin/sh

printf "\nping status\n"
PR="$(ping -c 2 www.google.com | tail -1| awk -F '/' '{print $5}' | cut -f1 -d'.')"
curl -X POST --header 'Content-Type: application/json' --header 'Accept: application/json' -d '{"jsonrpc": "2.0","meta": {},"method": "stats.insert","params": {"type": "ping", "data": {"host": "google.com", "value": "'"$PR"'", "units": "ms"}}}' http://127.0.0.1:9004/JSONRPC/stats.insert
# curl -X POST --header 'Content-Type: application/json' --header 'Accept: application/json' -d '{"jsonrpc": "2.0","meta": {},"method": "stats.insert","params": {"type": "ping", "data": {"host": "google.com", "value": "'"$PR"'", "units": "ms"}}}' http://127.0.0.1:9004/JSONRPC/stats.insert

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

curl -X POST --header 'Content-Type: application/json' --header 'Accept: application/json' -d '{"jsonrpc": "2.0","meta": {},"method": "stats.insert","params": {"type": "vpn", "data": {"raw": "'"$vpnStat"'"}}}' http://127.0.0.1:9004/JSONRPC/stats.insert
# curl -X POST --header 'Content-Type: application/json' --header 'Accept: application/json' -d '{"jsonrpc": "2.0","meta": {},"method": "stats.insert","params": {"type": "vpn", "data": {"raw": "dGVsbmV0PiBUcnlpbmcgMTI3LjAuMC4xLi4uCkNvbm5lY3RlZCB0byAxMjcuMC4wLjEuCkVzY2FwZSBjaGFyYWN0ZXIgaXMgJ15dJy4KPklORk86T3BlblZQTiBNYW5hZ2VtZW50IEludGVyZmFjZSBWZXJzaW9uIDEgLS0gdHlwZSAnaGVscCcgZm9yIG1vcmUgaW5mbwoxNTU0OTg3ODk2LENPTk5FQ1RFRCxTVUNDRVNTLDEwLjguMC4xLCwsLApFTkQK"}}}' http://127.0.0.1:9004/JSONRPC/stats.insert
printf "\n"
