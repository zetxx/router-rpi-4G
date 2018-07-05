docker run -it -d \
--name app \
--restart=unless-stopped \
-e NODE_ENV=prod \
-e LCD_ADDR=60 \
-v /usr/src/app/runtime:/home/zetxx/router-rpi-4G/router/app \
-v ~/tmp/db.sqlite:/db/db.sqlite \
--device /dev/i2c-0 \ #https://stackoverflow.com/questions/40265984/i2c-inside-a-docker-container
-p 3000:3000 \
nodejs
