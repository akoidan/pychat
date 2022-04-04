FROM alpine:3.13
# 3.12 alpine contains node 12.x.x which is specified in frontend/.nvmrc
# alpine 3.13 + has node v14+, which is incompatible atm with frontend
# 3.10 has incorrect version , but doesnt have issues with mariadb

ENV DB_DATA_PATH=/var/lib/mysql \
    DB_ROOT_PASS=pypass_root \
    DB_USER=pychat \
    DB_PASS=pypass \
    NGINX_VERSION=1.15.3 \
    NGINX_UPLOAD_MODULE_VERSION=2.3.0

WORKDIR /srv/http

RUN set -x &&\
    apk update &&\
    apk add --no-cache --virtual .build-deps \
            gcc \
            libc-dev \
            make \
            gettext \
            pcre-dev \
            zlib-dev \
            gnupg \
            libxslt-dev \
            gd-dev \
            geoip-dev \
            jpeg-dev \
            mariadb-dev \
            python3-dev \
            build-base \
            mariadb-client \
            linux-headers &&\
    apk add --no-cache \
            tzdata \
            mariadb-connector-c \
            redis \
            yarn \
            nodejs \
            python3 \
            openrc \
            mariadb \
            coturn \
            git \
            coturn-openrc \
            curl \
            bash \
            libffi-dev \
            vim \
            py3-pip
# mariadb-client - mysqlamin for db install
# mariadb-connector-c  for pip install mysqlclient
COPY ./download_content.sh .

# compile nginx with upload module
RUN  set -x && \
    bash download_content.sh build_nginx $NGINX_VERSION $NGINX_UPLOAD_MODULE_VERSION /tmp/runDepsFile &&\
    runDeps=$(cat /tmp/runDepsFile) &&\
    rm /tmp/runDepsFile &&\
    apk add --no-cache --virtual .nginx-rundeps $runDeps &&\
    mv /tmp/envsubst /usr/local/bin/

# https://github.com/gliderlabs/docker-alpine/issues/297#issuecomment-368695866 libffi-dev

COPY ./backend/requirements.txt ./backend/

RUN set -x && pip install -r backend/requirements.txt


# copies files from .dockerignore
COPY . ./

# 2022-04-03  9:46:54 0 [ERROR] mysqld: Got error 'File size bigger than expected' when trying to use aria control file '/var/lib/mysql/aria_log_control'
# w/o /var/lib/mysql/aria_log_control mysql wont start, seems like createdb creates invalid file


# this doesn't print errors to sdterr :(
#     ln -sf /dev/stderr /var/mysql.err && \
RUN set -x && \
    ln -s `which python3` "$(dirname `which python3`)/python" &&\
    sed -i 's/^\(tty\d\:\:\)/#\1/g' /etc/inittab &&\
    sed -i \
        -e 's/#rc_sys=".*"/rc_sys="docker"/g' \
        -e 's/#rc_env_allow=".*"/rc_env_allow="\*"/g' \
        -e 's/#rc_crashed_stop=.*/rc_crashed_stop=NO/g' \
        -e 's/#rc_crashed_start=.*/rc_crashed_start=YES/g' \
        -e 's/#rc_provide=".*"/rc_provide="loopback net"/g' \
        /etc/rc.conf &&\
    rm -f /etc/init.d/hwdrivers \
        /etc/init.d/hwclock \
        /etc/init.d/hwdrivers \
        /etc/init.d/modules \
        /etc/init.d/modules-load \
        /etc/init.d/modloop &&\
    sed -i 's/cgroup_add_service /# cgroup_add_service /g' /lib/rc/sh/openrc-run.sh &&\
    sed -i 's/VSERVER/DOCKER/Ig' /lib/rc/sh/init.sh &&\
    sed -ie 's/use net/use net\n\tneed populate/g' /etc/init.d/mariadb &&\
    sed -ie 's/use net localmount logger/use net localmount logger\n\tneed populate/g' /etc/init.d/redis &&\
    sed -ie 's/logfile .*/logfile \/dev\/stdout/g' /etc/redis.conf && \
    sed -ie 's/--syslog //g' /etc/init.d/mariadb && \
    sed -ie 's/\[mysqld\]/[mysqld]\nslow_query_log = 1 \n slow_query_log_file=\/dev\/stdout \n general_log = 1 \n general_log_file=\/tmp\/mysql.out \n log_error=\/tmp\/mysql.err \n/g' /etc/my.cnf.d/mariadb-server.cnf && \
    adduser -D -g '' http &&\
    addgroup -S nginx &&\
    adduser -D -S -h /var/cache/nginx -s /sbin/nologin -G nginx nginx &&\
    addgroup nginx tty &&\
    addgroup mysql tty && \
    mv ./docker/populate /etc/init.d/  &&\
    mv ./docker/tornado /etc/init.d/ &&\
    mv ./docker/nginx /etc/init.d/ &&\
    mv ./docker/nginx.conf /etc/nginx/ && \
    cp ./backend/chat/settings_docker.py ./backend/chat/settings.py &&\
    echo 'SECRET_KEY="123"'>> ./backend/chat/settings.py &&\
    rm -f /tmp/mysql.err && \
    rm -f /tmp/mysql.out && \
    bash download_content.sh create_db && \
    rm -f /tmp/mysql.err && \
    rm -f /tmp/mysql.out && \
    rm ./backend/chat/settings.py && \
    rm -rf ./docker &&\
    mv /var/lib/mysql ./mysql &&\
    chmod a+x /etc/init.d/tornado &&\
    chmod a+x /etc/init.d/populate &&\
    chmod a+x /etc/init.d/nginx &&\
    rc-update add mariadb default &&\
    rc-update add nginx default &&\
    rc-update add populate default &&\
    rc-update add tornado default &&\
    rc-update add redis default &&\
    rc-update add turnserver default &&\
    chown -R http:http . &&\
    rm -rf /var/lib/redis &&\
    mv ./backend/chat/migrations . &&\
    ln -sf /data/settings.py ./backend/chat/settings.py && \
    ln -sf /data/production.json ./frontend/build/production.json && \
    ln -sf /data/turnserver.conf /etc/coturn/turnserver.conf && \
    mkdir /etc/nginx/ssl &&\
    ln -sf /data/certificate.crt /etc/nginx/ssl && \
    ln -sf /data/server.key /etc/nginx/ssl && \
    ln -sf /data/photos ./backend && \
    ln -sf /data/redis /var/lib && \
    ln -sf /data/mysql /var/lib && \
    ln -sf /dev/stderr /var/log/nginx/error.log && \
    ln -sf /data/migrations ./backend/chat

RUN cd frontend && yarn install --frozen-lockfile

VOLUME [ "/sys/fs/cgroup" ]

EXPOSE 443
CMD ["/sbin/init"]



