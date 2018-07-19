FROM alpine:edge
#FROM alpine:latest

LABEL maintainer=""

RUN apk --no-cache upgrade &&\
	apk --no-cache add g++ &&\
	mkdir /data &&\
	chown daemon:daemon /data

VOLUME ["/data"]

WORKDIR /data

CMD ["rethinkdb"]
