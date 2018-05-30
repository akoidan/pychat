FROM alpine:3.7
WORKDIR /usr/src
ENV PYCHAT_CONFIG docker
RUN set -x &&\
apk update &&\
apk add python3 python3-dev mariadb-dev build-base linux-headers pcre-dev sassc bash curl &&\
pip3 install mysqlclient &&\
pip3 install uwsgi &&\
apk del python3-dev mariadb-dev build-base linux-headers &&\
apk add mariadb-client-libs &&\
ln -s `which python3` "$(dirname `which python3`)/python"
COPY ./requirements.txt .
RUN pip3 install -r requirements.txt
COPY ./manage.py ./config.json ./DefaultSmilies.cfpack ./docker/chat-uwsgi.ini ./download_content.sh ./
COPY ./chat ./chat/
COPY ./templates  ./templates
RUN bash download_content.sh all