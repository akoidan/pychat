# cd <root>
# docker build -f ./kubernetes/docker/backend/Dockerfile -t deathangel908/pychat-backend .
# docker push deathangel908/pychat-backend
FROM alpine:3.15

WORKDIR /usr/src/backend

RUN apk add --no-cache --virtual .build-deps \
                gcc \
                libc-dev \
                linux-headers \
                mariadb-dev \
                python3-dev \
                python3 \
                py3-pip \
                jpeg-dev \
                bash
COPY ./backend/requirements.txt ./

# create django tables within container init
COPY ./download_content.sh ./download_content.sh

RUN pip install -r requirements.txt && ln -s ../newback/photos ./photos

COPY ./backend/chat ./chat
COPY ./backend/templates ./templates
COPY ./backend/manage.py ./
COPY ./kubernetes/docker/backend/settings.py ./chat/settings.py

CMD ["/usr/bin/python3", "manage.py", "start_tornado"]






