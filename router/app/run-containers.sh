docker run -it -d \
--name app \
--restart=unless-stopped \
-e LCD_ADDR=60 \
-v <host_dir>:/usr/src/app/runtime \
-v <host_db_dir>/db.sqlite:/db/db.sqlite \
#https://stackoverflow.com/questions/40265984/i2c-inside-a-docker-container
--device /dev/i2c-1 \
-p 3000:3000 \
nodejs
