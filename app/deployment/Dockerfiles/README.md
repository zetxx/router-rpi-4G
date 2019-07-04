# Build

```bash
docker build -t nodejs-local -f deployment/Dockerfiles/main.docker . && \
docker build -t app4g -f deployment/Dockerfiles/app.docker . && \
docker build -t chromium4g -f deployment/Dockerfiles/chromium.docker .
```

## network
```bash
docker network create 4gnet
```

# RUN

## Storage, eg. postgresql
```bash
docker run -it -d \
--restart=unless-stopped \
--network 4gnet \
-m=128m \
--cpus=1 \
--log-opt max-size=20m \
--log-opt max-file=1 \
-v ${PWD}:/var/lib/postgresql/data \
--name postgres \
-e POSTGRES_PASSWORD=123 \
-e POSTGRES_USER=postgres \
-p 5432:5432 \
postgres:alpine
```

## Logger
```bash
docker run -it -d \
--restart=unless-stopped \
--name 4g-logger \
--network 4gnet \
-m=128m \
--cpus=1 \
--log-opt max-size=20m \
--log-opt max-file=1 \
-v ${PWD}:/app \
app4g \
logger \
-- \
--discovery=false \
--api.port=9000 \
--log.level=trace
```

## Storage
```bash
docker run -it -d \
--restart=unless-stopped \
--network 4gnet \
--name 4g-storage \
-m=128m \
--cpus=1 \
--log-opt max-size=20m \
--log-opt max-file=1 \
-v ${PWD}:/app \
-p 9004:9000 \
app4g \
storage \
-- \
--discovery=false \
--resolve.globalPort=9000 \
--resolve.map.logger=4g-logger \
--api.port=9000 \
--log.level=trace \
--storage.host=postgres \
--storage.user=rpi4g \
--storage.password=123 \
--storage.database=rpi4g \
--storage.schema=rpi4g
```

## Modem
```bash
docker run -it -d \
--restart=unless-stopped \
--network 4gnet \
--name 4g-modem \
-m=128m \
--cpus=1 \
--log-opt max-size=20m \
--log-opt max-file=1 \
-v ${PWD}:/app \
-p 9001:9000 \
app4g \
modem \
-- \
--discovery=false \
--resolve.globalPort=9000 \
--resolve.map.logger=4g-logger \
--resolve.map.storage=4g-storage \
--api.port=9000 \
--log.level=trace \
--modem.uri="http://10.21.21.1" \
--modem.triggerEventTimeout=60000 \
--http.timeout=10000
```

## NetProvider
```bash
docker run -it -d \
--restart=unless-stopped \
--network 4gnet \
--name 4g-net-provider \
-m=128m \
--cpus=1 \
--log-opt max-size=20m \
--log-opt max-file=1 \
-v ${PWD}:/app \
app4g \
netProvider \
-- \
--discovery=false \
--resolve.globalPort=9000 \
--resolve.map.logger=4g-logger \
--resolve.map.storage=4g-storage \
--api.port=9000 \
--log.level=trace \
--http.timeout=20000
```

## OnlineChecker
```bash
docker run -it -d \
--restart=unless-stopped \
--network 4gnet \
--name 4g-online-checker \
-m=128m \
--cpus=1 \
--log-opt max-size=20m \
--log-opt max-file=1 \
-v ${PWD}:/app \
app4g \
onlineChecker \
-- \
--discovery=false \
--resolve.globalPort=9000 \
--resolve.map.logger=4g-logger \
--resolve.map.storage=4g-storage \
--resolve.map.storage=4g-modem \
--api.port=9000 \
--log.level=trace
```

## Chromium

```bash
docker run -it -d \
--restart=unless-stopped \
--network 4gnet \
-m=256m \
--cpus=1 \
--name 4g-chromium \
-p 61000:9222 \
--cap-add=SYS_ADMIN \
chromium4g
```

## ScreenControl
```bash
docker run -it -d \
--privileged \
--restart=unless-stopped \
--network 4gnet \
--name 4g-screen-control \
-m=128m \
--cpus=1 \
--log-opt max-size=20m \
--log-opt max-file=1 \
-v ${PWD}:/app \
app4g \
screenControl \
-- \
--discovery=false \
--resolve.globalPort=9000 \
--resolve.map.logger=4g-logger \
--resolve.map.storage=4g-storage \
--api.port=9000 \
--log.level=trace \
--screenControl.screenshot.uri="http://4g-screen-control:34523/screen.html?port=9000" \
--screenControl.screenshot.host="4g-chromium:61000" \
--screenControl.refreshInterval=30000
```

## Home rpi
### Storage
```bash
docker run -it -d \
--restart=unless-stopped \
--network 4gnet \
--name 4g-storage \
-m=128m \
--cpus=1 \
--log-opt max-size=20m \
--log-opt max-file=1 \
-v ${PWD}:/app \
app4g \
storage \
-- \
--discovery=false \
--resolve.globalPort=9000 \
--resolve.map.logger=4g-logger \
--api.port=9000 \
--log.level=trace \
--storage.host=10.8.0.99 \
--storage.user=rpi4g \
--storage.password=123 \
--storage.database=rpi4g \
--storage.schema=rpi4g
```
### ScreenControl
```bash
docker run -it -d \
--privileged \
--restart=unless-stopped \
--network 4gnet \
--name 4g-screen-control \
-m=128m \
--cpus=1 \
--log-opt max-size=20m \
--log-opt max-file=1 \
-v ${PWD}:/app \
-p 34523:34523 \
-p 9005:9000 \
app4g \
screenControl \
-- \
--discovery=false \
--resolve.globalPort=9000 \
--resolve.map.logger=4g-logger \
--resolve.map.storage=4g-storage \
--api.port=9000 \
--log.level=trace \
--screenControl.screenshot.uri="http://10.8.0.1:34523/screen.html?port=9005" \
--screenControl.screenshot.host="10.8.0.1:61000" \
--screenControl.refreshInterval=30000
```

## run temporary
- `docker run -it -v ${PWD}:/app --entrypoint "" --rm app4g /bin/ash`
- `docker run -it --rm --device /dev/spidev0.0 --device /dev/spidev0.1 --entrypoint "" app4g /bin/ash`

### run temporary screen control
```bash
docker run -it --rm --network 4gnet --privileged -v ${PWD}:/app -p 34523:34523  --entrypoint "" app4g /bin/ash
docker run -it --rm --network 4gnet --entrypoint "" app4g /bin/ash
docker run -it --rm  -v ${PWD}:/app --entrypoint "" mysnapshot /bin/ash

docker run -it --rm \
--network 4gnet \
--name 4g-storage \
-m=128m \
--cpus=1 \
-v ${PWD}:/app \
--entrypoint "" app4g /bin/ash
```
