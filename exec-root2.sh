#!/bin/sh

cp /root/router-rpi-4G/system/boot/config.txt /boot/
cp /root/router-rpi-4G/system/etc/fstab /etc/
userdel -f -r alarm
mount -a

systemctl enable docker.service && systemctl start docker.service && systemctl stop docker.service
mv /var/lib/docker /mounts/docker
sync
ln -s /mounts/docker/docker/ /var/lib/docker

user="zetxx"
echo "$user  ALL=(ALL:ALL) ALL" >> /etc/sudoers
#add user
useradd -m -s /bin/zsh -d /home/$user $user
#add user to specific groups
usermod -a -G docker $user
passwd $user
