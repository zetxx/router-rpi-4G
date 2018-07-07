#!/bin/sh

mkdir /store && \
chmod 0777 -R /store

#install neceraly software
pacman-key --init
pacman-key --populate archlinuxarm
pacman -Suy --noconfirm git ntp docker curl openssh openvpn iptraf-ng sudo zsh i2c-tools lm_sensors base-devel archey3
git clone https://github.com/zetxx/router-rpi-4G.git /root/router-rpi-4G
chmod +x /root/router-rpi-4G/exec-root2.sh
sync
