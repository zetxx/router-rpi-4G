#!/bin/sh

systemctl enable docker.service
systemctl start docker.service
#user="zetxx"
#add user
useradd -m -s /bin/zsh -d /home/$user $user
#add user to specific groups
usermod -a -G docker $user
passwd $user
