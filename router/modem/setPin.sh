#! /bin/sh
sleep 10

curl -d "isTest=false&goformId=ENTER_PIN&PinNumber=1234" -X POST -k -o /tmp/pin_set_response http://192.168.0.1/goform/goform_set_cmd_process