#!/bin/sh
#install neceraly software
pacman-key --init && \
pacman-key --populate archlinuxarm && \
pacman -Suy --noconfirm git ntp docker curl openssh openvpn iptraf-ng sudo zsh i2c-tools lm_sensors
