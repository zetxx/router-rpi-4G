# Build
- `docker build -t nodejs-local -f deployment/Dockerfiles/main.docker .`
- `docker build -t app4g -f deployment/Dockerfiles/app.docker .`
- `docker build -t discovery4g -f deployment/Dockerfiles/discovery.docker .`

## discovery server
```bash
docker run -it -d --name discovery4g -m=64m discovery4g
```

# RUN

## Logger
```bash
docker run -it -d \
--name 4gLogger \
-h logger \
--link=discovery \
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
Logger
```
## run temporary
- `docker run -it --link=discovery --rm nodejs /bin/ash`

# TMP
### debug
```bash
docker run -it -d --name discovery -m=512m -p 59100:59100/udp discovery
```