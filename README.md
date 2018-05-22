# 4G Raspbery pi router with usefull info displayed on oled display using: nodejs, docker, archlinux

![alt text](https://github.com/zetxx/router-rpi-4G/blob/master/tmp/in-action.png?raw=true)

## isnpired by https://esther.codes/post-pi_router_story/

## Resources
  ### 4G modem
    - https://wiki.archlinux.org/index.php/ZTE_MF_823_(Megafon_M100-3)_4G_Modem
    - https://www.development-cycle.com/2017/04/27/zte-mf823-inside/
    - detect i2c led and get id https://www.raspberrypi.org/forums/viewtopic.php?t=26784
    - https://www.rbit.at/wordpress/modem-router/zte-mf831-auf-modembetrieb-umstellen/
    - https://archlinuxarm.org/platforms/armv6/raspberry-pi

  ### 4G modem API

    - state: `http://192.168.0.1/goform/goform_get_cmd_process?multi_data=1&isTest=false&sms_received_flag_flag=0&sts_received_flag_flag=0&cmd=modem_main_state%2Cpin_status%2Cloginfo%2Cnew_version_state%2Ccurrent_upgrade_state%2Cis_mandatory%2Csignalbar%2Cnetwork_type%2Cnetwork_provider%2Cppp_status%2CEX_SSID1%2Csta_ip_status%2CEX_wifi_profile%2Cm_ssid_enable%2CRadioOff%2Csimcard_roam%2Clan_ipaddr%2Cstation_mac%2Cbattery_charging%2Cbattery_vol_percent%2Cbattery_pers%2Cspn_display_flag%2Cplmn_display_flag%2Cspn_name_data%2Cspn_b1_flag%2Cspn_b2_flag%2Crealtime_tx_bytes%2Crealtime_rx_bytes%2Crealtime_time%2Crealtime_tx_thrpt%2Crealtime_rx_thrpt%2Cmonthly_rx_bytes%2Cmonthly_tx_bytes%2Cmonthly_time%2Cdate_month%2Cdata_volume_limit_switch%2Cdata_volume_limit_size%2Cdata_volume_alert_percent%2Cdata_volume_limit_unit%2Croam_setting_option%2Cupg_roam_switch%2Cap_station_mode%2Csms_received_flag%2Csts_received_flag%2Csms_unread_num&_=1525871219867`
  
  ### Jail it
  https://stackoverflow.com/questions/40265984/i2c-inside-a-docker-container
