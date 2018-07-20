FROM stephank/archlinux:armv7-latest

LABEL maintainer="Elin Angelow"

RUN pacman -Suy --noconfirm rethinkdb && pacman -Scc --noconfirm && mkdir /data

VOLUME ["/data"]

WORKDIR /data

CMD ["rethinkdb", "--bind", "all"]
