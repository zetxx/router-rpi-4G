FROM alpine:edge
#FROM alpine:latest

LABEL maintainer=""

RUN apk --no-cache upgrade &&\
	apk --no-cache add g++ protobuf protobuf-dev boost-dev curl m4 wget openssl-dev &&\
	mkdir /data &&\
	chown daemon:daemon /data
RUN mkdir -p /tmp && cd /tmp
RUN wget https://download.rethinkdb.com/dist/rethinkdb-2.3.6.tgz
RUN tar xf rethinkdb-2.3.6.tgz
RUN cd rethinkdb-2.3.6
RUN ./configure --with-system-malloc --allow-fetch
RUN make ALLOW_WARNINGS=1
RUN make install ALLOW_WARNINGS=1

VOLUME ["/data"]

WORKDIR /data

CMD ["rethinkdb"]
