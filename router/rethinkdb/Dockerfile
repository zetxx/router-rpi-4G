FROM alpine:edge
#FROM alpine:latest

LABEL maintainer=""

RUN apk --no-cache upgrade &&\
	apk --no-cache add g++ protobuf protobuf-dev boost-dev curl m4 wget openssl-dev &&\
	mkdir /data &&\
	chown daemon:daemon /data

VOLUME ["/data"]

WORKDIR /data

CMD ["rethinkdb"]
