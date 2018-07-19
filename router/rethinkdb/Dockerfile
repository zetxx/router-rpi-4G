FROM alpine:edge
#FROM alpine:latest

LABEL maintainer=""

RUN apk --no-cache upgrade &&\
	apk --no-cache add g++ protobuf protobuf-dev boost-dev curl m4 wget openssl-dev &&\
	mkdir /data &&\
	chown daemon:daemon /data
RUN cd /tmp && \
      wget https://download.rethinkdb.com/dist/rethinkdb-2.3.6.tgz && \
      tar xf rethinkdb-2.3.6.tgz && \
      cd rethinkdb-2.3.6 && \
      ./configure --with-system-malloc --allow-fetch && \
      make ALLOW_WARNINGS=1 && \
      make install ALLOW_WARNINGS=1

VOLUME ["/data"]

WORKDIR /data

CMD ["rethinkdb"]
