#!/bin/bash

# defining the project structure
set +x
safeRunCommand() {
  printf '\e[95m%s\e[0;33;40m\n' "$*"
  eval "$@"
  ret_code=$?
  if [ $ret_code != 0 ]; then
    printf "\e[91mExecution of command below has failed \e[93m\n"
    >&2 echo "$@"
    printf "\e[91mResult code is $ret_code \e[0;37;40m\n"
    exit $ret_code
  fi
}

RED='\033[0;31m'
GREEN='\033[0;32m'

if [ -z ${PROJECT_ROOT+x} ]; then
   PROJECT_ROOT="`dirname \"$0\"`"
fi

safeRunCommand cd "$PROJECT_ROOT"

PROJECT_ROOT=$PWD # otherwise it's gonna be `.` instead of full path
TMP_DIR="${TMP_DIR:-/tmp/pychat_tmp_dir}"
FE_DIRECTORY="$PROJECT_ROOT/frontend"
BE_DIRECTORY="$PROJECT_ROOT/backend"
DIST_DIRECTORY="$FE_DIRECTORY/dist"
ASSETS_DIR="$FE_DIRECTORY/src/assets"
FONT_DIR="$ASSETS_DIR/font"
SMILEYS_DIR="$ASSETS_DIR/smileys"
SASS_DIR="$ASSETS_DIR/sass"
# Implementing installed files
declare -a files=(\
    "$FONT_DIR/fontello.eot"
    "$FONT_DIR/fontello.svg"
    "$FONT_DIR/fontello.ttf"
    "$FONT_DIR/fontello.woff"
    "$FONT_DIR/fontello.woff2"
    "$FONT_DIR/fontello.woff2"
    "$SASS_DIR/partials/fontello.scss"
)

create_venv() {
    cd $BE_DIRECTORY
    rm -rf $BE_DIRECTORY/.venv
    virtualenv --system-site-packages .venv --python=`which python3`
    source .venv/bin/activate
    pip install -r requirements.txt
}

generate_certificate() {
    key_path="$1/server.key"
    cert_path="$1/certificate.crt"
    #openssl req -newkey rsa:2048 -new -nodes -keyout ./docker/pychat.org/server.key -out ./docker/pychat.org/csr.pem
    #openssl x509 -req -days 365 -in ./docker/pychat.org/csr.pem -signkey ./docker/pychat.org/server.key -out ./docker/pychat.org/certificate.crt
    safeRunCommand openssl req -nodes  -new -x509 -keyout "$key_path" -out "$cert_path" -days 3650
    printOut "Generated server.key in $key_path\nGenerated certificate in $cert_path"
}

rename_root_directory() {
    pattern="/srv/http"
    printOut "Replacing all occurences of $pattern to $PROJECT_ROOT in $PROJECT_ROOT/rootfs"
    grep -rl "$pattern" "$PROJECT_ROOT/rootfs" |xargs sed -i "s#$PROJECT_ROOT#$PWD#g"
}

update_docker() {
    safeRunCommand docker build -f ./docker/Dockerfile -t deathangel908/pychat .
    safeRunCommand docker build -f ./docker/pychat.org/Dockerfile -t deathangel908/pychat-test .
    safeRunCommand docker push deathangel908/pychat
    safeRunCommand docker push deathangel908/pychat-test
}

minikube_reload_frontend() {
  minikube_reload backend DockerfileBackend
}

minikube_reload_backend() {
  minikube_reload frontend DockerfileFrontend
}

minikube_reload() {
  image=$1
  dockerfile=$2
  # service can be not deployed yet, do not wait
  kubectl delete -f ./kubernetes/$image.yaml --wait=true
  safeRunCommand docker build -f ./kubernetes/$dockerfile -t deathangel908/pychat-$image .
  safeRunCommand minikube image rm deathangel908/pychat-$image
  safeRunCommand minikube image load deathangel908/pychat-$image
}


minikube_frontend() {
  safeRunCommand minikube_reload_frontend
  safeRunCommand kubectl apply -f kubernetes/frontend.yaml
}

minikube_backend() {
  safeRunCommand minikube_reload_backend
  safeRunCommand kubectl apply -f kubernetes/backend.yaml
}

minikube_delete_all() {
  kubectl delete -f kubernetes/ingress.yaml --wait=true
  kubectl delete -f kubernetes/backend.yaml --wait=true
  kubectl delete -f kubernetes/migrate-backend.yaml --wait=true
  kubectl delete -f kubernetes/mariadb.yaml --wait=true
  kubectl delete -f kubernetes/redis.yaml --wait=true
  kubectl delete -f kubernetes/secret.yaml --wait=true
  kubectl delete -f kubernetes/config-map.yaml --wait=true
  kubectl delete -f kubernetes/pv-photo.yaml --wait=true
  kubectl delete -f kubernetes/pv-mariadb.yaml --wait=true
  kubectl delete -f kubernetes/namespace.yaml --wait=true
}

minikube_all() {
  safeRunCommand kubectl apply -f kubernetes/namespace.yaml
  safeRunCommand kubectl apply -f kubernetes/pv-photo.yaml
  safeRunCommand kubectl apply -f kubernetes/pv-mariadb.yaml
  safeRunCommand kubectl apply -f kubernetes/config-map.yaml
  safeRunCommand kubectl apply -f kubernetes/secret.yaml
  safeRunCommand kubectl apply -f kubernetes/mariadb.yaml
  safeRunCommand kubectl apply -f kubernetes/redis.yaml
  safeRunCommand minikube_reload_backend
  safeRunCommand kubectl apply -f kubernetes/migrate-backend.yaml
  safeRunCommand kubectl apply -f kubernetes/backend.yaml
  safeRunCommand minikube_reload_frontend
  safeRunCommand kubectl apply -f kubernetes/ingress.yaml
}

rename_domain() {
    exist_domain="pychat\.org"
    your_domain="$1"
    printOut "Replacing all occurences of $exist_domain to $your_domain in $PROJECT_ROOT/rootfs"
    grep -rl "$exist_domain" "$PROJECT_ROOT/rootfs" |xargs sed -i "s#$exist_domain#$your_domain#g"
}

check_files() {
    if [ "$1" = "remove_script" ]; then
        delete_tmp_dir
    fi
    printOut "checking files"
    # Checking if all files are loaded
    failed_count=0
    for path in "${files[@]}" ; do
      if [ ! -f "$path" ] && [ ! -d "$path" ]; then #if doen't exist
        ((failed_count++))
         printError "Can't find file: $path"
         failed_items[$failed_count]="$path"
      else
        echo "File $path exists"
      fi
    done

    if [[ $failed_count > 0 ]]; then
      for path_failed2 in "${failed_count[@]}" ; do
        printError "$path_failed2 is missing"
      done
      if [ "$1" = "remove_script" ]; then
        printError "Please report for missing files at https://github.com/akoidan/pychat/issues/new"
      fi
      exit 1
    else
        if [ "$1" = "remove_script" ]; then
            printSuccess "All files are installed. Population succeeded"
        else
            printOut "All files are present"
        fi
    fi
}

compile_js() {
    if [ -z "$(ls $DIST_DIRECTORY)" ]; then
       safeRunCommand cd "$FE_DIRECTORY"
       safeRunCommand yarn build
    else
        printOut "Js is already compiled in $DIST_DIRECTORY"
    fi
}

printSuccess() {
    printf "\e[92m$1\e[0;37;40m\n"
}

printOut() {
    printf "\e[93m$1\e[0;37;40m\n"
}

printError() {
    >&2  printf "\e[91m$1\e[0;37;40m\n"
}

remove_old_files() {
    printOut "Removing old files"
    # Deleting all content creating empty dirs
    for path in "${files[@]}" ; do
      if [ -f "$path" ]; then
       rm -v "$path"
       elif  [ -d "$path" ]; then
       rm -rv "$path"
      fi
    done

}

zip_extension() {
    printOut "Zipping extension"
    EX_FILE="$PROJECT_ROOT/extension.zip"
    rm -f "$EX_FILE"
    zip -j -r "$EX_FILE" ./screen_cast_extension/background.js ./screen_cast_extension/icon-16.png ./screen_cast_extension/icon-128.png ./screen_cast_extension/manifest.json
    printOut "Extension is created in $EX_FILE"
}


chp(){
    size=${#1}
    indent=$((25 - $size))
    printf "\e[1;37;40m$1\e[0;36;40m"
    printf " "
    for (( c=1; c<= $indent; c++))  ; do
    printf "."
    done
    printf " \e[0;33;40m$2\n\e[0;37;40m"
}


post_fontello_conf() {
    printOut "Creating fontello config"
    safeRunCommand curl --silent --show-error --fail --form "config=@./frontend/font-config.json" --output $FE_DIRECTORY/.fontello https://fontello.com
    fontello_session=$(cat $FE_DIRECTORY/.fontello)
    url="https://fontello.com/`cat $FE_DIRECTORY/.fontello`"
    echo "Genereted fontello url: $url"
}

show_fontello_session() {
    fontello_session=$(cat $FE_DIRECTORY/.fontello)
    url="https://fontello.com/`cat $FE_DIRECTORY/.fontello`"
    printOut "Fonts url is: $url"
    echo "It has been opened in new browser tab"
    python -mwebbrowser $url
}


download_fontello() {
    fontello_session=$(cat $FE_DIRECTORY/.fontello)
    printOut "Downloading fontello using fontello session '$fontello_session'"
    mkdir -p "$TMP_DIR/fontello"
    safeRunCommand curl -X GET "https://fontello.com/$fontello_session/get" -o "$TMP_DIR/fonts.zip"
    safeRunCommand unzip "$TMP_DIR/fonts.zip" -d "$TMP_DIR/fontello"
    dir=$(ls "$TMP_DIR/fontello")
    echo '@charset "UTF-8";' > "$SASS_DIR/partials/fontello.scss"
    cat "$TMP_DIR/fontello/$dir/css/fontello.css" | grep ^.icon >> "$SASS_DIR/partials/fontello.scss"
    safeRunCommand cp -v "$TMP_DIR/fontello/$dir/css/animation.css" "$SASS_DIR/partials/animation.scss"
    safeRunCommand cp -v "$TMP_DIR/fontello"/$dir/font/* "$FONT_DIR"
    safeRunCommand cp -v "$TMP_DIR/fontello"/$dir/demo.html "$ASSETS_DIR/demo.html"
    safeRunCommand cp -v "$TMP_DIR/fontello"/$dir/config.json "$FE_DIRECTORY/font-config.json"

    if type "sed" &> /dev/null; then
        sed -i '1i\@charset "UTF-8";' "$SASS_DIR/partials/fontello.scss"
    else
        printError "WARNING: sass would be compiled w/o encoding"
    fi
}

generate_smileys() {
    printOut "Generating smileys"
    safeRunCommand python $FE_DIRECTORY/extract_cfpack.py
}

delete_tmp_dir() {
    if [  -d "$TMP_DIR" ]; then #if doen't exist
         printOut "Removing temporary files in $TMP_DIR"
         rm -rfv "$TMP_DIR"
    fi
}

build_nginx() {
    NGINX_VERSION="$1"
    NGINX_UPLOAD_MODULE_VERSION="$2"
    RUN_DEPS="$3"
    GPG_KEYS=B0F4253373F8F6F510D42178520A9993A1C052F8
    safeRunCommand mkdir -p /tmp/nginx
    safeRunCommand cd /tmp/nginx
    safeRunCommand curl -fSL https://nginx.org/download/nginx-$NGINX_VERSION.tar.gz -o nginx.tar.gz
    safeRunCommand curl -fSL https://nginx.org/download/nginx-$NGINX_VERSION.tar.gz.asc -o nginx.tar.gz.asc
    export GNUPGHOME="$(mktemp -d)"
    found='';
    for server in \
        ha.pool.sks-keyservers.net \
        hkp://keyserver.ubuntu.com:80 \
        hkp://p80.pool.sks-keyservers.net:80 \
        pgp.mit.edu \
    ; do
        echo "Fetching GPG key $GPG_KEYS from $server";
        gpg --keyserver "$server" --keyserver-options timeout=10 --recv-keys "$GPG_KEYS" && found=yes && break;
    done;
    test -z "$found" && echo >&2 "error: failed to fetch GPG key $GPG_KEYS" && exit 1;
    safeRunCommand gpg --batch --verify nginx.tar.gz.asc nginx.tar.gz
    safeRunCommand rm -rf "$GNUPGHOME" nginx.tar.gz.asc
    safeRunCommand tar -zxC /tmp/nginx -f nginx.tar.gz
    safeRunCommand rm nginx.tar.gz
    safeRunCommand curl -fSLO https://github.com/fdintino/nginx-upload-module/archive/$NGINX_UPLOAD_MODULE_VERSION.zip
    safeRunCommand unzip $NGINX_UPLOAD_MODULE_VERSION.zip
    safeRunCommand cd /tmp/nginx/nginx-$NGINX_VERSION
    CONFIG="\
        --prefix=/etc/nginx \
        --add-module=/tmp/nginx/nginx-upload-module-$NGINX_UPLOAD_MODULE_VERSION/ \
        --sbin-path=/usr/sbin/nginx \
        --modules-path=/usr/lib/nginx/modules \
        --conf-path=/etc/nginx/nginx.conf \
        --error-log-path=/var/log/nginx/error.log \
        --http-log-path=/var/log/nginx/access.log \
        --pid-path=/var/run/nginx.pid \
        --lock-path=/var/run/nginx.lock \
        --http-client-body-temp-path=/var/cache/nginx/client_temp \
        --http-proxy-temp-path=/var/cache/nginx/proxy_temp \
        --http-fastcgi-temp-path=/var/cache/nginx/fastcgi_temp \
        --http-uwsgi-temp-path=/var/cache/nginx/uwsgi_temp \
        --http-scgi-temp-path=/var/cache/nginx/scgi_temp \
        --user=nginx \
        --group=nginx \
        --with-http_ssl_module \
        --with-http_realip_module \
        --with-http_addition_module \
        --with-http_sub_module \
        --with-http_dav_module \
        --with-http_flv_module \
        --with-http_mp4_module \
        --with-http_gunzip_module \
        --with-http_gzip_static_module \
        --with-http_random_index_module \
        --with-http_secure_link_module \
        --with-http_stub_status_module \
        --with-http_auth_request_module \
        --with-http_xslt_module=dynamic \
        --with-http_image_filter_module=dynamic \
        --with-http_geoip_module=dynamic \
        --with-threads \
        --with-stream \
        --with-stream_ssl_module \
        --with-stream_ssl_preread_module \
        --with-stream_realip_module \
        --with-stream_geoip_module=dynamic \
        --with-http_slice_module \
        --with-mail \
        --with-mail_ssl_module \
        --with-compat \
        --with-file-aio \
        --with-http_v2_module \
    "
    safeRunCommand ./configure $CONFIG --with-debug
    safeRunCommand make -j$(getconf _NPROCESSORS_ONLN)
    safeRunCommand mv objs/nginx objs/nginx-debug
    safeRunCommand mv objs/ngx_http_xslt_filter_module.so objs/ngx_http_xslt_filter_module-debug.so
    safeRunCommand mv objs/ngx_http_image_filter_module.so objs/ngx_http_image_filter_module-debug.so
    safeRunCommand mv objs/ngx_http_geoip_module.so objs/ngx_http_geoip_module-debug.so
    safeRunCommand mv objs/ngx_stream_geoip_module.so objs/ngx_stream_geoip_module-debug.so
    safeRunCommand ./configure $CONFIG
    safeRunCommand make -j$(getconf _NPROCESSORS_ONLN)
    safeRunCommand make install
    safeRunCommand rm -rf /etc/nginx/html/
    safeRunCommand mkdir -p /usr/share/nginx/html/
    safeRunCommand install -m644 html/index.html /usr/share/nginx/html/
    safeRunCommand install -m644 html/50x.html /usr/share/nginx/html/
    safeRunCommand install -m755 objs/nginx-debug /usr/sbin/nginx-debug
    safeRunCommand install -m755 objs/ngx_http_xslt_filter_module-debug.so /usr/lib/nginx/modules/ngx_http_xslt_filter_module-debug.so
    safeRunCommand install -m755 objs/ngx_http_image_filter_module-debug.so /usr/lib/nginx/modules/ngx_http_image_filter_module-debug.so
    safeRunCommand install -m755 objs/ngx_http_geoip_module-debug.so /usr/lib/nginx/modules/ngx_http_geoip_module-debug.so
    safeRunCommand install -m755 objs/ngx_stream_geoip_module-debug.so /usr/lib/nginx/modules/ngx_stream_geoip_module-debug.so
    safeRunCommand ln -s ../../usr/lib/nginx/modules /etc/nginx/modules
    safeRunCommand strip /usr/sbin/nginx*
    safeRunCommand strip /usr/lib/nginx/modules/*.so
    safeRunCommand rm -rf /tmp/nginx
    if [ ! -z "$RUN_DEPS" ]; then
        safeRunCommand cp /usr/bin/envsubst /tmp/
        runDeps="$( \
          scanelf --needed --nobanner --format '%n#p' /usr/sbin/nginx /usr/lib/nginx/modules/*.so /tmp/envsubst \
            | tr ',' '\n' \
            | sort -u \
            | awk 'system("[ -e /usr/local/lib/" $1 " ]") == 0 { next } { print "so:" $1 }' \
        )"
        echo $runDeps > "$RUN_DEPS"
    fi
}


create_db() {
    files=$(shopt -s nullglob dotglob; echo ${DB_DATA_PATH}/*)
    if (( ${#files} ))
    then
        printOut "Database directory already exist"
        exit 0;
    else
        printOut "Database doesn't exist, creating one..."
        safeRunCommand mysql_install_db --user=mysql --datadir=${DB_DATA_PATH}
        printOut "Waiting mysql";
        mysqld_safe & bash -c 'echo -ne "Waiting mysql"; \
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
        fi' || exit 3

        printOut "Creating pychat database"
        mysqladmin -u root password "${DB_ROOT_PASS}"
        echo "GRANT ALL ON *.* TO ${DB_USER}@'127.0.0.1' IDENTIFIED BY '${DB_PASS}' WITH GRANT OPTION;\
        GRANT ALL ON *.* TO ${DB_USER}@'localhost' IDENTIFIED BY '${DB_PASS}' WITH GRANT OPTION;\
        GRANT ALL ON *.* TO ${DB_USER}@'::1' IDENTIFIED BY '${DB_PASS}' WITH GRANT OPTION;\
        create database pychat CHARACTER SET utf8mb4 COLLATE = utf8mb4_general_ci; \
        DELETE FROM mysql.user WHERE User='';\
        DROP DATABASE test;\
        FLUSH PRIVILEGES;"| mysql -u root --password="${DB_ROOT_PASS}" || exit 4
        printOut "Database has been created"
        create_django_tables
        safeRunCommand mysqladmin  -u root --password="${DB_ROOT_PASS}" shutdown
    fi
}


link_from_current_to_root() {
  for f in $(find . -type f); do
    dest=$(echo "$f"| cut -c2-)
    destdir="`dirname $dest`"
    mkdir -pv "$destdir"
    source="`readlink -f $f`"
    ln -svf "$source" "$dest"
  done
}

copy_root_fs() {
  cd ./rootfs
  link_from_current_to_root
}

create_django_tables() {
    cd $BE_DIRECTORY
    safeRunCommand python3 ./manage.py makemigrations chat
    safeRunCommand python3 ./manage.py migrate auth
    # because w/o second  `makemigrations chat` it doesn't work
    safeRunCommand python3 ./manage.py makemigrations chat
    safeRunCommand python3 ./manage.py migrate
    safeRunCommand python3 ./manage.py fill_data
}

copy_docker_prod_files() {
    safeRunCommand docker volume create pychat_data
    safeRunCommand docker container create --name dummy -v pychat_data:/data hello-world
    sed 's/"WEBRTC_CONFIG".*/"WEBRTC_CONFIG": {"iceServers":[{"urls":["turn:{}"],"username":"pychat", "credential":"pypass"}]}/g' ./docker/pychat.org/production.json >> ./docker/pychat.org/production-prod.json
    printOut "Generated production.json"
    cat ./docker/pychat.org/production-prod.json
    sed '/server-name=/d; /realm=/d' ./docker/pychat.org/turnserver.conf >> ./docker/pychat.org/turnserver-prod.conf
    printOut "Generated turnserver.conf"
    cat ./docker/pychat.org/turnserver-prod.conf
    safeRunCommand docker cp ./docker/pychat.org/certificate.crt dummy:/data/certificate.crt
    safeRunCommand docker cp ./docker/pychat.org/server.key dummy:/data/server.key
    safeRunCommand docker cp ./docker/pychat.org/settings.py dummy:/data/settings.py
    safeRunCommand docker cp ./docker/pychat.org/production-prod.json dummy:/data/production.json
    safeRunCommand docker cp ./docker/pychat.org/turnserver-prod.conf dummy:/data/turnserver.conf
    safeRunCommand rm ./docker/pychat.org/production-prod.json
    safeRunCommand rm ./docker/pychat.org/turnserver-prod.conf
    safeRunCommand docker rm dummy
    printSuccess "ALl files have been succesfully copied. To start docker container use:"
    printOut "docker run -t -v pychat_data:/data -p 443:443 -p 3478:3478 deathangel908/pychat"
    printSuccess "To edit files use:"
    printOut "docker run -i -t -v pychat_data:/tmp -it alpine /bin/sh"
}

android() {
  cd $FE_DIRECTORY
  ./node_modules/.bin/cordova build
  adb push ./platforms/android/app/build/outputs/apk/debug/app-debug.apk /data/local/tmp/
  adb shell pm uninstall org.pychat
  adb shell pm install /data/local/tmp/app-debug.apk
  adb reverse tcp:8888 tcp:8888
  adb reverse tcp:8080 tcp:8080
  adb shell am start -n org.pychat/org.pychat.MainActivity
}

generate_secret_key() {
    if [ ! -f "$BE_DIRECTORY/chat/settings.py" ]; then
        printError "File $BE_DIRECTORY/chat/settings.py doesn't exist. Create it before running the command"
        exit 1;
    fi
    echo "" >> $BE_DIRECTORY/chat/settings.py
    echo -n "SECRET_KEY = '" >> $BE_DIRECTORY/chat/settings.py
    LC_ALL=C LC_CTYPE=C tr -dc 'A-Za-z0-9!@#$%^&*(\-\_\=\+)' </dev/urandom | head -c 50 >> $BE_DIRECTORY/chat/settings.py
    echo "'" >> $BE_DIRECTORY/chat/settings.py
}

if [ "$1" = "post_fontello_conf" ]; then
    post_fontello_conf
    python -mwebbrowser "https://fontello.com/`cat $FE_DIRECTORY/.fontello`"
elif [ "$1" = "check_files" ]; then
    check_files
elif [ "$1" = "create_django_tables" ]; then
    create_django_tables
elif [ "$1" = "compile_js" ]; then
    compile_js
elif [ "$1" = "create_venv" ]; then
    create_venv
elif [ "$1" = "build_nginx" ]; then
    if [ -z "$3" ]
    then
        printError "pass minimum 3 variables"
        exit 1;
    fi
    build_nginx "$2" "$3" "$4"
elif [ "$1" = "create_db" ]; then
    create_db
elif [ "$1" = "rename_domain" ]; then
    if [ $# -eq 0  ]; then
        printError "Please provide domain name"
        exit 1;
    fi
    rename_domain $2
elif [ "$1" = "rename_root_directory" ]; then
    rename_root_directory
elif [ "$1" = "generate_certificate" ]; then
    if [ $# -eq 1 ]; then
         generate_certificate "$PROJECT_ROOT/rootfs/etc/nginx/ssl/"
    else
        generate_certificate "$2"
    fi
elif [ "$1" = "zip_extension" ]; then
    zip_extension
elif [ "$1" = "update_docker" ]; then
    update_docker
elif [ "$1" = "smileys" ]; then
    generate_smileys
elif [ "$1" = "print_icon_session" ]; then
    show_fontello_session
elif [ "$1" = "android" ]; then
    android
elif [ "$1" = "copy_docker_prod_files" ]; then
    copy_docker_prod_files
elif [ "$1" = "copy_root_fs" ]; then
    copy_root_fs
elif [ "$1" = "minikube_all" ]; then
    minikube_all
elif [ "$1" = "minikube_frontend" ]; then
    minikube_frontend
elif [ "$1" = "minikube_backend" ]; then
    minikube_backend
elif [ "$1" = "redirect" ]; then
    safeRunCommand sudo iptables -t nat -A PREROUTING -p tcp --dport 443 -j REDIRECT --to-port 8080
    safeRunCommand sudo iptables -t nat -I OUTPUT -p tcp -d 127.0.0.1 --dport 443 -j REDIRECT --to-ports 8080
elif [ "$1" = "delete_redirect" ]; then
    sudo iptables -t nat -v -L PREROUTING -n --line-number |grep 8080
    lines_prerouting=`sudo iptables -t nat -v -L PREROUTING -n --line-number |grep 8080 | awk '{print $1;}'`
    sudo iptables -t nat -v -L OUTPUT -n --line-number |grep 8080
    lines_postrouting=`sudo iptables -t nat -v -L OUTPUT -n --line-number |grep 8080 | awk '{print $1;}'`
    for value in $lines_prerouting; do
       safeRunCommand sudo iptables -t nat -D PREROUTING $value
    done

     for value2 in $lines_postrouting; do
       safeRunCommand  sudo iptables -t nat -D OUTPUT $value2
    done
elif [ "$1" = "download_fontello" ]; then
    download_fontello
    delete_tmp_dir
    git --no-pager diff "$FE_DIRECTORY/font-config.json"
    printSuccess "Fonts have been installed"
    printOut "You can view them at https://localhost:8000/static/demo.html"
elif [ "$1" == "generate_secret_key" ]; then
    generate_secret_key
else
    printf " \e[93mWellcome to pychat download manager running in `pwd`, available commands are:\n"
    chp generate_certificate "Create self-singed ssl certificate"
    chp rename_domain "Rename all occurrences of \e[96mpychat.org\e[0;33;40m in \e[96m$PROJECT_ROOT\e[0;33;40m for your domain name. Usage: \e[92mrename_domain your.domain.com"
    chp rename_root_directory "Rename all occurrences of \e[96m/srv/http\e[0;33;40m to \e[96m$PROJECT_ROOT\e[0;33;40m in \e[96m$PROJECT_ROOT/rootfs\e[0;33;40m"
    chp check_files "Verifies if all files are installed"
    chp zip_extension "Creates zip acrhive for ChromeWebStore from \e[96mscreen_cast_extension \e[0;33;40mdirectory"
    chp android "Deploys android app"
    printf " \e[93mIcons:\n\e[0;37;40mTo edit icons execute \e[92mpost_fontello_conf\e[0;37;40m, edit icons in opened browser and click Save session button. Afterwords execute \e[92mdownload_icon\n"
    chp post_fontello_conf "Creates fontello session from config.json and saves it to \e[96m $FE_DIRECTORY/.fontello \e[0;33;40mfile"
    chp print_icon_session "Shows current used url for editing fonts"
    chp download_fontello "Downloads and extracts fonts from fontello to project"
    chp generate_secret_key "Creates django secret key into \e[96m$BE_DIRECTORY/chat/settings.py\e[0;33;40m"
    chp create_db "Creates database pychat to mysql, the following environment variable should be defined \e[94mDB_ROOT_PASS DB_USER DB_PASS DB_DATA_PATH"
    chp update_docker "Builds docker images for deathangel908/pychat"
    chp copy_docker_prod_files "Copies dummy files to be able to test prod docker image deathange908/pychat"
    chp redirect "Redirects port 443 to port 8080, so you can use \e[96mhttps://pychat.org\e[0;33;40m for localhost if you have it in \e[96m/etc/hosts\e[0;33;40m"
    chp delete_redirect "Removes redirection above"
    chp compile_js "Compiles frontend SPA javascript if $DIST_DIRECTORY is empty"
    chp create_venv "removes .venv and creates a new one with dependencies"
    chp copy_root_fs "Creates soft links from \e[96m$PROJECT_ROOT/rootfs\e[0;33;40m to \e[96m/\e[0;33;40m"
    chp build_nginx "Build nginx with http-upload-module and installs it; . Usage: \e[92msh download_content.sh build_nginx 1.15.3 2.3.0  /tmp/depsFileList.txt\e[0;33;40m where 1.15 is nginx version, 2.3.0 is upload-http-module version"
    chp create_django_tables "Creates database tables and data"
    chp minikube_all "Creates/updates kubernetes cluster"
    chp minikube_backend "Build backend docker file and deploy/update it in minikube"
    chp minikube_frontend "Build frontend docker file and deploy/update it in minikube"
    exit 1
fi


#wget http://jscolor.com/release/jscolor-1.4.4.zip -P $TMP_DIR && unzip $TMP_DIR/jscolor-1.4.4.zip -d $JS_DIR
# fontello
# http://www.mineks.com/assets/admin/css/fonts/glyphicons.social.pro/
# Sounds
#curl -L -o $TMP_DIR/sounds.zip https://www.dropbox.com/sh/0whi1oo782noit1/AAC-F14YggOFqx3DO3e0AvqGa?dl=1 && unzip $TMP_DIR/sounds.zip -d $SOUNDS_DIR
set -x
