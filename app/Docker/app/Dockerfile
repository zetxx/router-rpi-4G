FROM alpine:edge

ENV statsapp_config__env prod
ENV NODE_PATH "/usr/src/app/modules/node_modules"

RUN cat /etc/alpine-release \
    && addgroup -g 1000 node \
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

CMD ["npm", "run", "server"]
