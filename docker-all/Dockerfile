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
sed -i 's/VSERVER/DOCKER/Ig' /lib/rc/sh/init.sh

RUN mysql_install_db --user=mysql --datadir=${DB_DATA_PATH} &&\
( mysqld_safe & bash -c 'echo -ne "Waiting mysql"; \
    mysqlFinish=0; \
    for i in 10 9 8 7 6 5 4 3 2 1; do \
            mysqladmin ping --silent; \
            a=$? ; \
            if (( $a == 0 )); then \
                    mysqlFinish=1; \
                    break;\
            fi;\
            sleep 1; \
            echo -ne "."; \
    done; \
    if (( $mysqlFinish == 0 )); then \
        echo -ne "Mysql startup failed"; \
        exit 2; \
    fi') &&\
mysqladmin -u root password "${DB_ROOT_PASS}" &&\
echo "GRANT ALL ON *.* TO ${DB_USER}@'127.0.0.1' IDENTIFIED BY '${DB_PASS}' WITH GRANT OPTION;\
GRANT ALL ON *.* TO ${DB_USER}@'localhost' IDENTIFIED BY '${DB_PASS}' WITH GRANT OPTION;\
GRANT ALL ON *.* TO ${DB_USER}@'::1' IDENTIFIED BY '${DB_PASS}' WITH GRANT OPTION;\
create database pychat CHARACTER SET utf8 COLLATE utf8_general_ci; \
DELETE FROM mysql.user WHERE User='';\
DROP DATABASE test;\
FLUSH PRIVILEGES;"| mysql -u root --password="${DB_ROOT_PASS}" &&\
mysqladmin  -u root --password="${DB_ROOT_PASS}" shutdown && \\
sed -i "s|max_allowed_packet\s*=\s*1M|max_allowed_packet = ${MAX_ALLOWED_PACKET}|g" /etc/mysql/my.cnf &&\
sed -i "s|max_allowed_packet\s*=\s*16M|max_allowed_packet = ${MAX_ALLOWED_PACKET}|g" /etc/mysql/my.cnf

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
rm ./chat/settings.py

EXPOSE 443
CMD ["/sbin/init"]



