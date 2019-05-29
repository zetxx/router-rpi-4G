# Build

```bash
docker build -t nodejs-local -f deployment/Dockerfiles/main.docker . && \
docker build -t app4g -f deployment/Dockerfiles/app.docker . && \
docker build -t discovery4g -f deployment/Dockerfiles/discovery.docker . && \
docker build -t chromium4g -f deployment/Dockerfiles/chromium.docker .
```

## network
```bash
docker network create 4gnet
```

## discovery server
```bash
docker run -it -d \
--network 4gnet \
--name discovery4g \
--restart=unless-stopped \
-m=64m \
discovery4g
```

# RUN

## Logger
```bash
docker run -it -d \
--restart=unless-stopped \
--name 4g-logger \
--network 4gnet \
--link=discovery4g \
-m=128m \
--cpus=1 \
--log-opt max-size=20m \
--log-opt max-file=1 \
-v ${PWD}:/app \
app4g \
logger \
-- \
--discovery.domain=borovica4g \
--discovery.server="discovery4g:59100" \
--api.port=9000 \
--log.level=trace
```

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
-p 9004:9004 \
app4g \
storage \
-- \
--discovery.nameResolve=true \
--discovery.domain=borovica4g \
--discovery.server="discovery4g:59100" \
--discovery.nodeName="4g-storage" \
--discovery.loopback=false \
--discovery.resolveMap.logger=4g-logger \
--api.port=9004 \
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
-p 9001:9001 \
app4g \
modem \
-- \
--discovery.nameResolve=true \
--discovery.domain=borovica4g \
--discovery.server="discovery4g:59100" \
--discovery.nodeName="4g-modem" \
--discovery.resolveMap.logger=4g-logger \
--discovery.resolveMap.storage=4g-storage \
--discovery.loopback=false \
--api.port=9001 \
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
--discovery.nameResolve=true \
--discovery.domain=borovica4g \
--discovery.server="discovery4g:59100" \
--discovery.nodeName="4g-net-provider" \
--discovery.resolveMap.logger=4g-logger \
--discovery.resolveMap.storage=4g-storage \
--discovery.loopback=false \
--api.port=9001 \
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
--discovery.nameResolve=true \
--discovery.domain=borovica4g \
--discovery.server="discovery4g:59100" \
--discovery.nodeName="4g-online-checker" \
--discovery.loopback=false \
--discovery.resolveMap.logger=4g-logger \
--discovery.resolveMap.storage=4g-storage \
--discovery.resolveMap.storage=4g-modem \
--api.port=9003 \
--log.level=trace
```

## Chromium

```bash
docker run -it -d \
--network 4gnet \
-m=128m \
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
--discovery.nameResolve=true \
--discovery.domain=borovica4g \
--discovery.server="discovery4g:59100" \
--discovery.nodeName="4g-screen-control" \
--discovery.loopback=false \
--discovery.resolveMap.logger=4g-logger \
--discovery.resolveMap.storage=4g-storage \
--api.port=9005 \
--log.level=trace \
--screenControl.refreshInterval=30000
```

## run temporary
- `docker run -it -v ${PWD}:/app --link=discovery --entrypoint "" --rm app4g /bin/ash`
- `docker run -it --rm --device /dev/spidev0.0 --device /dev/spidev0.1 --entrypoint "" app4g /bin/ash`

### run temporary screen control
```bash
docker run -it --rm --network 4gnet --privileged --entrypoint "" app4g /bin/ash
```
