# Build
- `docker build -t nodejs-local -f deployment/Dockerfiles/main.docker .`
- `docker build -t app4g -f deployment/Dockerfiles/app.docker .`
- `docker build -t discovery4g -f deployment/Dockerfiles/discovery.docker .`

## discovery server
```bash
docker run -it -d \
--name discovery4g \
--restart=unless-stopped \
-h discovery \
-m=64m \
discovery4g
```

# RUN

## Logger
```bash
docker run -it -d \
--restart=unless-stopped \
--name 4gLogger \
-h logger \
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
--discovery.server="discovery:59100" \
--api.port=9000 \
--log.level=trace
```

## Storage, eg. postgresql
```bash
docker run -it -d \
--restart=unless-stopped \
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
--name 4gStorage \
-m=128m \
--cpus=1 \
--log-opt max-size=20m \
--log-opt max-file=1 \
-v ${PWD}:/app \
-h storage \
--link=discovery4g \
--link=4gLogger \
--link=postgres \
-p 9004:9004 \
app4g \
storage \
-- \
--discovery.nameResolve=true \
--discovery.domain=borovica4g \
--discovery.server="discovery:59100" \
--discovery.loopback=false \
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
--name 4gModem \
-m=128m \
--cpus=1 \
--log-opt max-size=20m \
--log-opt max-file=1 \
-v ${PWD}:/app \
-h modem \
--link=discovery4g \
--link=4gLogger \
--link=4gStorage \
-p 9001:9001 \
app4g \
modem \
-- \
--discovery.nameResolve=true \
--discovery.domain=borovica4g \
--discovery.server="discovery:59100" \
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
--name 4gNetProvider \
-m=128m \
--cpus=1 \
--log-opt max-size=20m \
--log-opt max-file=1 \
-v ${PWD}:/app \
-h netProvider \
--link=discovery4g \
--link=4gLogger \
--link=4gStorage \
app4g \
netProvider \
-- \
--discovery.nameResolve=true \
--discovery.domain=borovica4g \
--discovery.server="discovery:59100" \
--discovery.loopback=false \
--api.port=9001 \
--log.level=trace \
--http.timeout=20000
```

## OnlineChecker
```bash
docker run -it -d \
--restart=unless-stopped \
--name 4gOnlineChecker \
-m=128m \
--cpus=1 \
--log-opt max-size=20m \
--log-opt max-file=1 \
-v ${PWD}:/app \
-h onlineChecker \
--link=discovery4g \
--link=4gLogger \
--link=4gStorage \
--link=4gModem \
app4g \
onlineChecker \
-- \
--discovery.nameResolve=true \
--discovery.domain=borovica4g \
--discovery.server="discovery:59100" \
--discovery.loopback=false \
--api.port=9003 \
--log.level=trace
```

## ScreenControl
```bash
docker run -it -d \
--device /dev/i2c-1 \
--restart=unless-stopped \
--name 4gScreenControl \
-m=128m \
--cpus=1 \
--log-opt max-size=20m \
--log-opt max-file=1 \
-v ${PWD}:/app \
-h screenControl \
--link=discovery4g \
--link=4gLogger \
--link=4gStorage \
app4g \
screenControl \
-- \
--discovery.nameResolve=true \
--discovery.domain=borovica4g \
--discovery.server="discovery:59100" \
--discovery.loopback=false \
--api.port=9005 \
--log.level=trace \
--screenControl.hwAddr=60
--screenControl.refreshInterval=20000
```

## run temporary
- `docker run -it -v ${PWD}:/app --link=discovery --entrypoint "" --rm app4g /bin/ash`

### run temporary screen control
- `docker run -it -v ${PWD}:/app --device /dev/i2c-1 --entrypoint "" --rm app4g /bin/ash`
