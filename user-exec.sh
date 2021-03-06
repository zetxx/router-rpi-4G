#!/bin/sh
git clone https://aur.archlinux.org/trizen.git /tmp/trizen
cd /tmp/trizen && makepkg -si
trizen -S --noedit --noconfirm raspi-config
#zsh
git clone git://github.com/robbyrussell/oh-my-zsh.git /home/zetxx/.oh-my-zsh
git clone https://github.com/zetxx/router-rpi-4G.git

rm /home/zetxx/.zshrc
ln -s /home/zetxx/router-rpi-4G/system/home/zetxx/.zshrc /home/zetxx/.zshrc

sudo timedatectl set-timezone Europe/Sofia
sudo systemctl enable ntpd.service && sudo systemctl start ntpd.service

#interface
sudo cp /home/zetxx/router-rpi-4G/system/etc/systemd/network/* /etc/systemd/network/
#journald
sudo cp /home/zetxx/router-rpi-4G/system/etc/systemd/journald.conf /etc/systemd/journald.conf
#docker
sudo cp /home/zetxx/router-rpi-4G/system/etc/docker/daemon.json /etc/docker/daemon.json

sudo cp /home/zetxx/router-rpi-4G/system/etc/systemd/system/router-rpi-4g-connect.service /etc/systemd/system/router-rpi-4g-connect.service
sudo cp /home/zetxx/router-rpi-4G/system/usr/bin/router-rpi-4g-connect.sh /usr/bin/router-rpi-4g-connect.sh
sudo chmod +x /usr/bin/router-rpi-4g-connect.sh
sudo systemctl enable router-rpi-4g-connect.service

crontab /home/zetxx/router-rpi-4G/system/home/zetxx/crontab/load
sudo systemctl enable cronie.service && sudo systemctl start cronie.service

sudo cp /home/zetxx/router-rpi-4G/system/etc/iptables/iptables.rules /etc/iptables/iptables.rules
sudo systemctl enable iptables.service && sudo systemctl start iptables.service

#copy ssh keys
mkdir /home/zetxx/.ssh
ln -s /home/zetxx/router-rpi-4G/system/home/zetxx/.ssh/authorized_keys /home/zetxx/.ssh/authorized_keys
#copy openvpn config
sudo mkdir -p /etc/openvpn/client/home-cert && sudo cp /home/zetxx/router-rpi-4G/system/etc/openvpn/client/* /etc/openvpn/client/
#copy openvpn keys
#..................
