#!/bin/bash

# defining the project structure
PROJECT_ROOT=`pwd`

RED='\033[0;31m'
GREEN='\033[0;32m'

RANDOM_DIR=$(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 32 | head -n 1)
TMP_DIR="${TMP_DIR:-/tmp/$RANDOM_DIR}"
ASSETS_DIR="${ASSETS_DIR:-$PROJECT_ROOT/fe/src/assets}"
FONT_DIR="${FONT_DIR:-$ASSETS_DIR/font}"
SMILEYS_DIR="${SMILEYS_DIR:-$ASSETS_DIR/smileys}"
SASS_DIR="${SASS_DIR:-$ASSETS_DIR/sass}"
# Implementing installed files
declare -a files=(\
    "$FONT_DIR/fontello.eot"
    "$FONT_DIR/fontello.svg"
    "$FONT_DIR/fontello.ttf"
    "$FONT_DIR/fontello.woff"
    "$FONT_DIR/fontello.woff2"
    "$FONT_DIR/fontello.woff2"
    "$SASS_DIR/partials/fontello.scss"
    "$SMILEYS_DIR"
    "$SMILEYS_DIR/info.json"
    "$SMILEYS_DIR/base/000a.gif"
)

cd "$PROJECT_ROOT"

generate_certificate() {
    key_path="$1/server.key"
    cert_path="$1/certificate.crt"
    safeRunCommand openssl req -nodes  -new -x509 -keyout "$key_path" -out "$cert_path" -days 3650
    printOut "Generated server.key in $key_path\nGenerated certificate in $cert_path"
}

rename_root_directory() {
    pattern="/srv/http"
    printOut "Replacing all occurences of $pattern to $PROJECT_ROOT in $PROJECT_ROOT/rootfs"
    grep -rl "$pattern" "$PROJECT_ROOT/rootfs" |xargs sed -i "s#$PROJECT_ROOT#$PWD#g"
}

update_docker() {
    safeRunCommand docker build -f ./docker-all/Dockerfile -t deathangel908/pychat .
    safeRunCommand docker build -f ./docker-all/pychat.org/Dockerfile -t deathangel908/pychat:test .
    safeRunCommand docker push deathangel908/pychat
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
        printError "Please report for missing files at https://github.com/Deathangel908/pychat/issues/new"
      fi
      exit 1
    else
        if [ "$1" = "remove_script" ]; then
            printSuccess "All files are installed. Population succeeded"
        else
            echo "All files are present"
        fi
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
    safeRunCommand curl --silent --show-error --fail --form "config=@./config.json" --output .fontello http://fontello.com
    fontello_session=$(cat .fontello)
    url="http://fontello.com/`cat .fontello`"
    echo "Genereted fontello url: $url"
}

show_fontello_session() {
    fontello_session=$(cat .fontello)
    url="http://fontello.com/`cat .fontello`"
    printOut "Fonts url is: $url"
    echo "It has been opened in new browser tab"
    python -mwebbrowser $url
}


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

download_fontello() {
    fontello_session=$(cat .fontello)
    printOut "Downloading fontello using fontello session '$fontello_session'"
    mkdir -p "$TMP_DIR/fontello"
    safeRunCommand curl -X GET "http://fontello.com/$fontello_session/get" -o "$TMP_DIR/fonts.zip"
    safeRunCommand unzip "$TMP_DIR/fonts.zip" -d "$TMP_DIR/fontello"
    dir=$(ls "$TMP_DIR/fontello")
    cat "$TMP_DIR/fontello/$dir/css/fontello.css" | grep ^.icon >  "$SASS_DIR/partials/fontello.scss"
    cp -v "$TMP_DIR/fontello"/$dir/font/* "$FONT_DIR"
    cp -v "$TMP_DIR/fontello"/$dir/demo.html "$ASSETS_DIR/demo.html"
    cp -v "$TMP_DIR/fontello"/$dir/config.json "$PROJECT_ROOT"

    if type "sed" &> /dev/null; then
        sed -i '1i\@charset "UTF-8";' "$SASS_DIR/partials/fontello.scss"
    else
        printError "WARNING: sass would be compiled w/o encoding"
    fi
}

generate_smileys() {
    printOut "Generating smileys"
    safeRunCommand python manage.py extract_cfpack
}

delete_tmp_dir() {
    if [  -d "$TMP_DIR" ]; then #if doen't exist
         printOut "Removing temporary files in $TMP_DIR"
         rm -rfv "$TMP_DIR"
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
        fi'

        printOut "Creating pychat database"
        mysqladmin -u root password "${DB_ROOT_PASS}"
        echo "GRANT ALL ON *.* TO ${DB_USER}@'127.0.0.1' IDENTIFIED BY '${DB_PASS}' WITH GRANT OPTION;\
        GRANT ALL ON *.* TO ${DB_USER}@'localhost' IDENTIFIED BY '${DB_PASS}' WITH GRANT OPTION;\
        GRANT ALL ON *.* TO ${DB_USER}@'::1' IDENTIFIED BY '${DB_PASS}' WITH GRANT OPTION;\
        create database pychat CHARACTER SET utf8 COLLATE utf8_general_ci; \
        DELETE FROM mysql.user WHERE User='';\
        DROP DATABASE test;\
        FLUSH PRIVILEGES;"| mysql -u root --password="${DB_ROOT_PASS}"
        printOut "Database has been created"
        mysqladmin  -u root --password="${DB_ROOT_PASS}" shutdown
    fi
}


generate_secret_key() {
    if [ ! -f "$PROJECT_ROOT/chat/settings.py" ]; then
        printError "File $PROJECT_ROOT/chat/settings.py doesn't exist. Create it before running the command"
        exit 1;
    fi
    echo "" >> $PROJECT_ROOT/chat/settings.py
    echo -n "SECRET_KEY = '" >> $PROJECT_ROOT/chat/settings.py
    tr -dc 'A-Za-z0-9!@#$%^&*(\-\_\=\+)' </dev/urandom | head -c 50 >> $PROJECT_ROOT/chat/settings.py
    echo "'" >> $PROJECT_ROOT/chat/settings.py
}

if [ "$1" = "generate_icon_session" ]; then
    post_fontello_conf
    python -mwebbrowser "http://fontello.com/`cat .fontello`"
elif [ "$1" = "check_files" ]; then
    check_files
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
elif [ "$1" = "redirect" ]; then
    safeRunCommand sudo iptables -t nat -A PREROUTING -p tcp --dport 443 -j REDIRECT --to-port 8080
    safeRunCommand sudo iptables -t nat -I OUTPUT -p tcp -d 127.0.0.1 --dport 443 -j REDIRECT --to-ports 8080
elif [ "$1" = "download_icon" ]; then
    download_fontello
    delete_tmp_dir
    git --no-pager diff "$PROJECT_ROOT/config.json"
    printSuccess "Fonts have been installed"
    printOut "You can view them at https://localhost:8000/static/demo.html"
elif [ "$1" == "all" ]; then
    remove_old_files
    generate_smileys
    post_fontello_conf
    download_fontello
    check_files "remove_script"
elif [ "$1" == "generate_secret_key" ]; then
    generate_secret_key
else
 printf " \e[93mWellcome to pychat download manager, available commands are:\n"
 chp generate_certificate "Create self-singed ssl certificate"
 chp rename_domain "Rename all occurrences of \e[96mpychat.org\e[0;33;40m in \e[96m$PROJECT_ROOT\e[0;33;40m for your domain name. Usage: \e[92mrename_domain your.domain.com"
 chp rename_root_directory "Rename all occurrences of \e[96m/srv/http\e[0;33;40m to \e[96m$PROJECT_ROOT\e[0;33;40m in \e[96m$PROJECT_ROOT/rootfs\e[0;33;40m"
 chp all "Downloads all content required for project"
 chp check_files "Verifies if all files are installed"
 chp zip_extension "Creates zip acrhive for ChromeWebStore from \e[96mscreen_cast_extension \e[0;33;40mdirectory"
 printf " \e[93mIcons:\n\e[0;37;40mTo edit icons execute \e[92mgenerate_icon_session\e[0;37;40m, edit icons in opened browser and click Save session button. Afterwords execute \e[92mdownload_icon\n"
 chp generate_icon_session "Creates fontello session from config.json and saves it to \e[96m .fontello \e[0;33;40mfile"
 chp print_icon_session "Shows current used url for editing fonts"
 chp download_icon "Downloads and extracts fonts from fontello to project"
 chp generate_secret_key "Creates django secret key into \e[96m$PROJECT_ROOT/chat/settings.py\e[0;33;40m"
 chp create_db "Creates database pychat to mysql, the following environment variable should be defined \e[94mDB_ROOT_PASS DB_USER DB_PASS DB_DATA_PATH"
 chp update_docker "Builds docker images for deathangel908/pychat"
 chp redirect "Redirects port 443 to port 8080, so you can use \e[96mhttps://pychat.org\e[0;33;40m for localhost if you have it in \e[96m/etc/hosts\e[0;33;40m"
fi


#wget http://jscolor.com/release/jscolor-1.4.4.zip -P $TMP_DIR && unzip $TMP_DIR/jscolor-1.4.4.zip -d $JS_DIR
# fontello
# http://www.mineks.com/assets/admin/css/fonts/glyphicons.social.pro/
# Sounds
#curl -L -o $TMP_DIR/sounds.zip https://www.dropbox.com/sh/0whi1oo782noit1/AAC-F14YggOFqx3DO3e0AvqGa?dl=1 && unzip $TMP_DIR/sounds.zip -d $SOUNDS_DIR
