FROM alpine:edge

ENV NODE_ENV prod
RUN cat /etc/alpine-release

RUN addgroup -g 1000 node \
    && adduser -u 1000 -G node -s /bin/sh -D node \
    && apk add --no-cache --virtual .build-deps \
        python \
        build-base \
        linux-headers \
        make \
        nodejs \
        && mkdir -p "/usr/src/app/modules" \
        && mkdir "/usr/src/app/runtime"

COPY ./package.json /usr/src/app/modules/
WORKDIR "/usr/src/app/modules"
RUN npm i

WORKDIR "/usr/src/app/runtime"
ENV NODE_PATH "/usr/src/app/modules/node_modules"

CMD ["npm", "run", "server"]
#build
#docker build -t statapp ./Docker/app/Dockerfile

#run temporary
#docker run --rm -it --device /dev/i2c-1 i2c /bin/sh
