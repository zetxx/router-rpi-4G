FROM stephank/archlinux:armv7-latest

LABEL maintainer="Elin Angelow"

RUN pacman -Suy --noconfirm rethinkdb && pacman -Scc --noconfirm && mkdir /data

VOLUME ["/data"]

WORKDIR /data

EXPOSE 8080/tcp

CMD ["rethinkdb", "--bind", "all"]

# build
    ## docker build -t rethinkdb