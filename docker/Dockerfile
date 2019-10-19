FROM alpine:3.10.0

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
            curl \
            bash \
            libffi-dev \
            vim
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

COPY ./requirements.txt ./

RUN set -x && \
    pip3 install mysqlclient &&\
    pip3 install -r requirements.txt && \
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
    sed -ie 's/\[mysqld\]/[mysqld]\nslow_query_log = 1 \n slow_query_log_file=\/dev\/stdout \n general_log = 1 \n general_log_file=\/dev\/stdout \n log_error=\/dev\/mysql.err \n/g' /etc/my.cnf.d/mariadb-server.cnf && \
    adduser -D -g '' http &&\
    addgroup -S nginx &&\
    adduser -D -S -h /var/cache/nginx -s /sbin/nologin -G nginx nginx


# copies files from .dockerignore
COPY . ./

RUN set -x && \
    mv ./docker/populate /etc/init.d/  &&\
    mv ./docker/tornado /etc/init.d/ &&\
    mv ./docker/nginx /etc/init.d/ &&\
    mv ./docker/nginx.conf /etc/nginx/ && \
    cp ./chat/settings_docker.py ./chat/settings.py &&\
    echo 'SECRET_KEY="123"'>> ./chat/settings.py &&\
    bash download_content.sh create_db && \
    rm ./chat/settings.py && \
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
    chown -R http:http . &&\
    rm -rf /var/lib/redis &&\
    rm -rf ./http/photos &&\
    mv ./chat/migrations . &&\
    ln -sf /data/settings.py ./chat/settings.py && \
    ln -sf /data/production.json ./fe/production.json && \
    mkdir /etc/nginx/ssl &&\
    ln -sf /data/certificate.crt /etc/nginx/ssl && \
    ln -sf /data/server.key /etc/nginx/ssl && \
    ln -sf /data/photos ./ && \
    ln -sf /data/redis /var/lib && \
    ln -sf /data/mysql /var/lib && \
    ln -sf /dev/stderr /dev/mysql.err && \
    ln -sf /dev/stderr /var/log/nginx/error.log && \
    ln -sf /data/migrations ./chat &&\
    cd fe &&\
    yarn install

VOLUME [ "/sys/fs/cgroup" ]

EXPOSE 443
CMD ["/sbin/init"]



