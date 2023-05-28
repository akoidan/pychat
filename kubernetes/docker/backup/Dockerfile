# cd <root>
# docker build -f ./kubernetes/docker/backup/Dockerfile -t deathangel908/pychat-backup .
# docker push deathangel908/pychat-backup

FROM alpine:3.15

WORKDIR /src

RUN apk --update add bash git openssh-client mysql-client
COPY ./kubernetes/docker/backup/backup.sh /src/
