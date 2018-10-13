App that collects data and prints it on lcd

+ # Docker
  + ## Build
    - ### App
      ```bash
      docker build -t statapp . -f ./Docker/app/Dockerfile
      ```
    - ### Storage
      ```bash
      docker build -t rethinkdb . -f ./Docker/rethinkdb/Dockerfile
      ```
  + ## Run
    + ### PROD
      - #### storage
        ```bash
        docker run -it -d \
        --restart=unless-stopped \
        -v "/mounts/store1/docker-volumes/rethinkdb/4g/data:/data" \
        -p 8080:8080 \
        --name rethink-4g \
        rethinkdb
        ```
      - #### APP
        ```bash
        docker run -it -d \
        --name statapp \
        --restart=unless-stopped \
        --link=rethink-4g \
        -e statsapp_config__lcdAddr=60 \
        -e statsapp_config__modem__uri="http://10.21.21.1" \
        -v /home/zetxx/router-rpi-4G/app:/usr/src/app/runtime \
        --device /dev/i2c-1 \
        -p 3000:3000 \
        statapp
        ```
    + ### DEV
      - #### storage
        ```bash
        docker run -it -d \
        --restart=unless-stopped \
        -v "/store/data/rethink/4g-router:/data" \
        -p 8080:8080 \
        -p 28015:28015 \
        -p 29015:29015 \
        --name rethink-4g \
        rethinkdb
        ```
      - #### APP
        ```bash
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
        ```

    + ### temporary
      - #### app
        ```bash
        docker run -it --rm \
        --link=rethink-4g \
        -e LCD_ADDR=60 \
        -v /home/zetxx/router-rpi-4G/app:/usr/src/app/runtime \
        --device /dev/i2c-1 \
        -p 3000:3000 \
        statapp /bin/ash
        ```
