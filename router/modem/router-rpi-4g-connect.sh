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
