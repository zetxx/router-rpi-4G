#!/bin/sh

#install neceraly software
pacman -Suy --noconfirm git ntp docker curl openssh openvpn iptraf-ng sudo zsh i2c-tools lm_sensors
systemctl enable docker.service
systemctl start docker.service
user="zetxx"
#add user
useradd -m -s /bin/zsh -d /home/$user $user
#add user to specific groups
usermod -a -G docker $user
passwd $user
