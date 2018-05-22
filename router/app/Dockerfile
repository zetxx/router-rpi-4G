FROM alpine:edge

ENV NODE_VERSION 10.1.0
RUN cat /etc/alpine-release

RUN addgroup -g 1000 node \
    && adduser -u 1000 -G node -s /bin/sh -D node \
    && apk add --no-cache --virtual .build-deps \
        binutils-gold \
        libstdc++ \
        g++ \
        gcc \
        gnupg \
        libgcc \
        linux-headers \
        python \
        build-base \
        make \
        nodejs

RUN mkdir "/db"
RUN mkdir "/usr/src"
RUN mkdir "/usr/src/app"
WORKDIR "/usr/src/app"
COPY . .

RUN npm i yarn -g
RUN yarn install --ignore-engines

CMD ["npm", "run", "server"]
#build
#docker build -t i2c . -f ./Dockerfile-apine

#run temporary
#docker run --rm -it --device /dev/i2c-1 i2c /bin/sh
