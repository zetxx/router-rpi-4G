# Build
- `docker build -t nodejs-local -f deployment/Dockerfiles/main.docker .`
- `docker build -t app4g -f deployment/Dockerfiles/app.docker .`
- `docker build -t discovery4g -f deployment/Dockerfiles/discovery.docker .`

## discovery server
```bash
docker run -it -d \
--name discovery4g \
--restart=unless-stopped \
-h discovery -p 59100:59100/udp \
-m=64m \
discovery4g
```

# RUN

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
-e logger_discovery__domain="borovica4g" \
-e logger_discovery__server="discovery:59100" \
-e logger_api__port=9000 \
-e logger_api__address="0.0.0.0" \
-e logger_log__level=trace \
app4g \
logger
```
## run temporary
- `docker run -it --link=discovery --rm nodejs /bin/ash`

# TMP
### debug
```bash
docker run -it -d --name discovery -m=512m -p 59100:59100/udp discovery
```