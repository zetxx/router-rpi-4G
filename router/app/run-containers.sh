docker run -it -d \
--name app \
--restart=unless-stopped \
-e NODE_ENV=prod \
-v ~/tmp/db.sqlite:/db/db.sqlite \
--device /dev/i2c-0 \ #https://stackoverflow.com/questions/40265984/i2c-inside-a-docker-container
-p 3000:3000 \
nodejs