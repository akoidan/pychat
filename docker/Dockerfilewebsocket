FROM alpine:3.7
WORKDIR /usr/src
ENV PYCHAT_CONFIG docker
RUN set -x &&\
apk update &&\
apk add python3 python3-dev mariadb-dev build-base curl &&\
pip3 install mysqlclient &&\
apk del python3-dev mariadb-dev build-base &&\
apk add mariadb-client-libs &&\
ln -s `which python3` "$(dirname `which python3`)/python"
COPY ./requirements.txt ./
COPY ./manage.py ./
RUN pip3 install -r requirements.txt
COPY ./chat ./chat/
COPY ./templates  ./templates
