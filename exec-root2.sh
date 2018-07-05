#!/bin/sh

cp /root/router-rpi-4G/etc/fstab /etc/
userdel -f -r alarm
mount -a

user="zetxx"
echo "$user  ALL=(ALL:ALL) ALL" >> /etc/sudoers
#add user
useradd -m -s /bin/zsh -d /home/$user $user
#add user to specific groups
usermod -a -G docker $user
passwd $user
