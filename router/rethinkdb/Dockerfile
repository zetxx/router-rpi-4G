FROM alpine:edge
#FROM alpine:latest

LABEL maintainer=""

RUN apk --no-cache upgrade &&\
	apk --no-cache add curl build-base bash python2 linux-headers bsd-compat-headers m4 paxmark protobuf-dev icu-dev libressl-dev curl-dev boost-dev libexecinfo-dev &&\
	mkdir /data &&\
	chown daemon:daemon /data &&\
	mkdir -p /tmp &&\
	curl -o /tmp/rethinkdb.tgz https://download.rethinkdb.com/dist/rethinkdb-2.3.6.tgz

WORKDIR /tmp
RUN tar xf /tmp/rethinkdb.tgz

WORKDIR /tmp/rethinkdb-2.3.6
#RUN ./configure --with-system-malloc --allow-fetch
#RUN make ALLOW_WARNINGS=1
#RUN make install ALLOW_WARNINGS=1

#VOLUME ["/data"]

#WORKDIR /data

#CMD ["rethinkdb"]
