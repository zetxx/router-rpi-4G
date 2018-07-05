#!/bin/sh
git clone https://aur.archlinux.org/trizen.git /tmp/trizen
cd /tmp/trizen && makepkg -si
trizen -S --noedit --noconfirm raspi-config
#zsh
git clone git://github.com/robbyrussell/oh-my-zsh.git /home/zetxx/.oh-my-zsh
rm /home/zetxx/.zshrc
ln -s /home/zetxx/router-rpi-4G/home/zetxx/.zshrc /home/zetxx/.zshrc

sudo timedatectl set-timezone Europe/Sofia
sudo systemctl enable ntpd.service && sudo systemctl start ntpd.service

sudo cp /home/zetxx/router-rpi-4G/router/modem/router-rpi-4g-connect.service /etc/systemd/system/router-rpi-4g-connect.service
sudo cp /home/zetxx/router-rpi-4G/router/modem/router-rpi-4g-connect.sh /usr/bin/router-rpi-4g-connect.sh
sudo chmod +x /usr/bin/router-rpi-4g-connect.sh
sudo systemctl enable router-rpi-4g-connect.service

sudo cp /home/zetxx/router-rpi-4G/router/modem/router-rpi-4g-status.service /etc/systemd/system/router-rpi-4g-status.service
sudo cp /home/zetxx/router-rpi-4G/router/modem/router-rpi-4g-status.sh /usr/bin/router-rpi-4g-status.sh
sudo chmod +x /usr/bin/router-rpi-4g-status.sh
sudo systemctl enable router-rpi-4g-status.service

#copy ssh keys
mkdir /home/zetxx/.ssh
#chmod 0644 /home/zetxx/.ssh
ln -s /home/zetxx/router-rpi-4G/home/zetxx/.ssh/authorized_keys /home/zetxx/.ssh/authorized_keys
#copy openvpn config
sudo mkdir -p /etc/openvpn/client/home/ && sudo cp /home/zetxx/router-rpi-4G/etc/openvpn/client/* /etc/openvpn/client/home/
#copy openvpn keys
#????

#ip_forward
sudo cp /home/zetxx/router-rpi-4G/etc/sysctl.d/* /etc/sysctl.d/
#interface
sudo cp /home/zetxx/router-rpi-4G/etc/systemd/network/* /etc/systemd/network/

#install python adafruit-ssd1306 ... maybe
#sudo pip install adafruit-ssd1306
