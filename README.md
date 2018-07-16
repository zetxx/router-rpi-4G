# 4G Raspbery pi router with usefull info displayed on oled display using: nodejs, docker, archlinux and some magic :)

![alt text](https://github.com/zetxx/router-rpi-4G/blob/master/tmp/in-action.png?raw=true)

## isnpired by https://esther.codes/post-pi_router_story/

## Resources
  ### 4G modem
  - https://wiki.archlinux.org/index.php/ZTE_MF_823_(Megafon_M100-3)_4G_Modem
  - https://www.development-cycle.com/2017/04/27/zte-mf823-inside/
  - detect i2c led and get id https://www.raspberrypi.org/forums/viewtopic.php?t=26784
  - https://www.rbit.at/wordpress/modem-router/zte-mf831-auf-modembetrieb-umstellen/
  - https://archlinuxarm.org/platforms/armv6/raspberry-pi
  
  ### telnet it
  
  - telnet 192.168.0.1
  - Login: root
  - Pwd: zte9x15
  
  ### Jail it
  https://stackoverflow.com/questions/40265984/i2c-inside-a-docker-container

  #### back up
  - make: `sudo dd bs=4M if=/dev/mmcblk0 status=progress | gzip > /home/your_username/today.gz`
  - unmake: `sudo gzip -dc /home/your_username/image.gz | dd bs=4M of=/dev/mmcblk0 status=progress`

@todo rm +x from services, add +x to /boot/config.txt
