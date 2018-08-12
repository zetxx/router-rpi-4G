#https://stackoverflow.com/questions/40265984/i2c-inside-a-docker-container

docker run -it -d \
--name app \
--restart=unless-stopped \
--link=rethink-4g \
-e LCD_ADDR=60 \
-v /home/zetxx/router-rpi-4G/router/app:/usr/src/app/runtime \
-v /mounts/store1/router-rpi-4G/db/:/db/ \
--device /dev/i2c-1 \
-p 3000:3000 \
i2c

docker run -it -d \
--restart=unless-stopped \
-v "/store/data/rethink/4g-router:/data" \
-p 8080:8080 \
--name rethink-4g \
rethinkdb

## TMP
    ### APP
docker run -it -d \
--name app \
--restart=unless-stopped \
--link=rethink-4g \
-e LCD_ADDR=60 \
-v "/store/31.0GB/projects/router-rpi-4G/router/app:/usr/src/app/runtime" \
-v /store/db.sqlite/:/db/ \
--device /dev/i2c-1 \
-p 3000:3000 \
i2c

    ### db
docker run -it -d \
--restart=unless-stopped \
-v "/store/data/rethink/4g-router:/data" \
-p 8080:8080 \
--name rethink-4g \
rethinkdb

## build RPI
docker run -it --rm rethinkdb /bin/bash
