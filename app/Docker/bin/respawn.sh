#!/bin/sh

docker stop statapp \
    && docker rm statapp \
    && git pull \
    && docker run -it -d \
        --name statapp \
        --restart=unless-stopped \
        --link=rethink-4g \
        -e statsapp_config__lcd__addr=60 \
        -e statsapp_config__modem__uri="http://10.21.21.1" \
        -e statsapp_config__storage__host="rethink-4g" \
        -v /home/zetxx/router-rpi-4G/app:/usr/src/app/runtime \
        --device /dev/i2c-1 \
        -p 3000:3000 \
        statapp