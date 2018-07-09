#https://stackoverflow.com/questions/40265984/i2c-inside-a-docker-container

docker run -it -d \
--name app \
--restart=unless-stopped \
-e LCD_ADDR=60 \
-v <host_dir>:/usr/src/app/runtime \
-v <host_db_dir>/db.sqlite:/db/db.sqlite \
--device /dev/i2c-1 \
-p 3000:3000 \
i2c


## TMP

docker run -it -d \
--name app \
--restart=unless-stopped \
-e LCD_ADDR=60 \
-v /store/31.0GB/projects/router-rpi-4G/router/app:/usr/src/app/runtime \
-v /store/db.sqlite:/db/db.sqlite \
--device /dev/i2c-1 \
-p 3000:3000 \
i2c