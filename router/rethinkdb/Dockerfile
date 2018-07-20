FROM alpine:edge
#FROM alpine:latest

LABEL maintainer=""

RUN apk --no-cache upgrade &&\
	apk --no-cache add make g++ protobuf protobuf-dev boost-dev curl m4 wget openssl-dev build-base &&\
	mkdir /data &&\
	chown daemon:daemon /data &&\
	mkdir -p /tmp &&\
	curl -L -o /tmp/rethinkdb.tgz https://download.rethinkdb.com/dist/rethinkdb-latest.tgz

WORKDIR /tmp
RUN tar xf /tmp/rethinkdb.tgz

WORKDIR /tmp/rethinkdb-2.3.6
RUN configure --with-system-malloc --allow-fetch
#RUN make ALLOW_WARNINGS=1
#RUN make install ALLOW_WARNINGS=1

#VOLUME ["/data"]

#WORKDIR /data

#CMD ["rethinkdb"]
