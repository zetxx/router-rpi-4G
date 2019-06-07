# 4G Raspbery pi router with usefull info displayed on oled display using: nodejs, docker, archlinux and some magic :). [isnpired by](https://esther.codes/post-pi_router_story/)

![screen in action](https://github.com/zetxx/router-rpi-4G/blob/master/app/docs/images/1.png?raw=true)

## 4G modem
- [zte unlock code](https://tools.texby.com/unlock-codes/zte/)

### MF 825
* telnet it
  - telnet 192.168.0.1
  - Login: root
  - Pwd: zte9x15
* links
  - https://wiki.archlinux.org/index.php/ZTE_MF_823_(Megafon_M100-3)_4G_Modem
  - https://www.development-cycle.com/2017/04/27/zte-mf823-inside/
  - detect i2c led and get id https://www.raspberrypi.org/forums/viewtopic.php?t=26784
  - https://www.rbit.at/wordpress/modem-router/zte-mf831-auf-modembetrieb-umstellen/
  - https://archlinuxarm.org/platforms/armv6/raspberry-pi

### MF 831
* links
  - https://4pda.ru/forum/index.php?showtopic=555876&st=1400
  - https://technicalexperiments.wordpress.com/2015/10/30/zte-mf831-for-use-with-openwrt-serial-modem-instead-of-cdc_ether/
  - https://www.rbit.at/wordpress/uncategorized/zte-modem-mf831-telnet-ssh-zugang/

## Screen - SSD1351

### Links

- https://github.com/rm-hull/luma.oled/issues/174
- https://www.waveshare.com/w/upload/5/5b/1.5inch_RGB_OLED_Module_User_Manual_EN.pdf
- https://www.raspberrypi-spy.co.uk/wp-content/uploads/2012/06/Raspberry-Pi-GPIO-Layout-Model-B-Plus-rotated-2700x900.png
- https://www.freetronics.com.au/pages/oled128-quickstart-guide-raspberry-pi
- https://gitlab.com/ftmazzone/ssd1351
- https://github.com/GoogleChrome/puppeteer/blob/v1.17.0/docs/api.md#browsernewpage

### Wiring

| SSD1351 pin    |RPi pin|RPi func          |
|----------------|:------|:-----------------|
| VCC            |   2   |   5V             |
| GND            |   6   |   GND            |
| DC             |   18  |  GPIO24          |
| DIN            |   19  |GPIO10(SPI0_MOSI) |
| RST            |   22  |  GPIO25          |
| CLK            |   23  |GPIO11(SPI0_SCLK) |
| CS             |   24  |GPIO8(SPI0_CEO_N) |

## Docker
- enable memory limit in containers: append this to `/boot/cmdline.txt` `cgroup_enable=memory cgroup_memory=1`
- https://stackoverflow.com/questions/40265984/i2c-inside-a-docker-container

### back up
- make: `sudo dd bs=4M if=/dev/mmcblk0 status=progress | gzip > /home/your_username/today.gz`
- unmake: `sudo gzip -dc /home/your_username/image.gz | dd bs=4M of=/dev/mmcblk0 status=progress`
