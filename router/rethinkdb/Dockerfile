FROM alpine:edge
#FROM alpine:latest

LABEL maintainer=""

RUN apk --no-cache upgrade &&\
	apk --no-cache add make g++ protobuf protobuf-dev boost-dev curl m4 wget openssl-dev build-base &&\
	mkdir /data &&\
	chown daemon:daemon /data &&\
	mkdir -p /tmp/rethinkdb &&\
        wget https://download.rethinkdb.com/dist/rethinkdb-2.3.6.tgz --output-file=/tmp/rethinkdb.tgz &&\
        tar xf rethinkdb.tgz -C /tmp/rethinkdb

WORKDIR /tmp/rethinkdb
RUN configure --with-system-malloc --allow-fetch
#RUN make ALLOW_WARNINGS=1
#RUN make install ALLOW_WARNINGS=1

#VOLUME ["/data"]

#WORKDIR /data

#CMD ["rethinkdb"]
