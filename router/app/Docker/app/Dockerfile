FROM alpine:edge

ENV NODE_VERSION 10.1.0
ENV NODE_ENV prod
RUN cat /etc/alpine-release

RUN addgroup -g 1000 node \
    && adduser -u 1000 -G node -s /bin/sh -D node \
    && apk add --no-cache --virtual .build-deps \
        python \
        build-base \
        linux-headers \
        make \
        nodejs

RUN mkdir "/db"
RUN mkdir -p "/usr/src/app/modules"
RUN mkdir "/usr/src/app/runtime"
WORKDIR "/usr/src/app/modules"
COPY ./package.json .

RUN npm i yarn -g
RUN yarn install --ignore-engines

WORKDIR "/usr/src/app/runtime"
ENV NODE_PATH "/usr/src/app/modules/node_modules"

CMD ["npm", "run", "server"]
#build
#docker build -t i2c . -f ./Dockerfile-apine

#run temporary
#docker run --rm -it --device /dev/i2c-1 i2c /bin/sh
