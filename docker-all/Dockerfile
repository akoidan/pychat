FROM alpine:3.6

ENV SASS_LIBSASS_PATH=/usr/src/sass/libsass \
    PYCHAT_CONFIG=docker_all \
    DB_DATA_PATH=/var/lib/mysql \
    DB_ROOT_PASS=pypass_root \
    DB_USER=pychat \
    DB_PASS=pypass \
    MAX_ALLOWED_PACKET=200

WORKDIR /srv/http
RUN set -x  &&\
adduser -D -g '' http &&\
apk update &&\
apk add redis python3 python3-dev openrc mariadb-dev mariadb-client mariadb build-base curl nginx sassc linux-headers pcre-dev sassc bash &&\
pip3 install mysqlclient &&\
pip3 install uwsgi &&\
apk del mariadb-dev python3-dev build-base linux-headers &&\
apk add mariadb-client-libs &&\
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
sed -i "s|max_allowed_packet\s*=\s*1M|max_allowed_packet = ${MAX_ALLOWED_PACKET}|g" /etc/mysql/my.cnf &&\
sed -i "s|max_allowed_packet\s*=\s*16M|max_allowed_packet = ${MAX_ALLOWED_PACKET}|g" /etc/mysql/my.cnf &&\
sed -i 's|eerror "Datadir \x27\$required_dirs\x27 is empty or invalid\."|bash /srv/http/download_content.sh create_db|g' /etc/init.d/mariadb &&\
sed -i '/eerror "Run \x27\/etc\/init.d\/mariadb setup\x27 to create new database."/d' /etc/init.d/mariadb

COPY ./manage.py ./config.json ./DefaultSmilies.cfpack ./docker-all/chat-uwsgi.ini ./download_content.sh requirements.txt ./
COPY ./chat ./chat/
COPY ./docker-all/uwsgi ./docker-all/tornado /etc/init.d/
COPY ./templates  ./templates
COPY ./docker-all/nginx.conf /etc/nginx

RUN mkdir log &&\
chmod a+x /etc/init.d/tornado &&\
chmod a+x /etc/init.d/uwsgi &&\
rc-update add mariadb default &&\
rc-update add nginx default &&\
rc-update add uwsgi default &&\
rc-update add tornado default &&\
rc-update add redis default &&\
pip3 install -r requirements.txt &&\
cp ./chat/settings_example.py ./chat/settings.py &&\
bash download_content.sh generate_secret_key &&\
bash download_content.sh all &&\
chown -R http:http /srv/http/ &&\
rm ./chat/settings.py

EXPOSE 443
CMD ["/sbin/init"]



