#!/bin/bash

# defining the project structure
PROJECT_ROOT=`pwd`

RED='\033[0;31m'
GREEN='\033[0;32m'

RANDOM_DIR=$(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 32 | head -n 1)
TMP_DIR="/tmp/$RANDOM_DIR"
STATIC_PARENT="$PROJECT_ROOT/chat"
STATIC_DIR="$STATIC_PARENT/static"
JS_DIR="$STATIC_DIR/js"
CSS_DIR="$STATIC_DIR/css"
FONT_DIR="$STATIC_DIR/font"
SOUNDS_DIR="$STATIC_DIR/sounds"
SMILEYS_DIR="$STATIC_DIR/smileys"
IMAGES_DIR="$STATIC_DIR/images"
SASS_DIR="$STATIC_DIR/sass"
# Implementing installed files
declare -a files=(\
    "$CSS_DIR/pikaday.css" \
    "$JS_DIR/pikaday.js" \
    "$JS_DIR/moment.js" \
    "$FONT_DIR/fontello.eot" \
    "$FONT_DIR/fontello.svg" \
    "$FONT_DIR/fontello.ttf" \
    "$FONT_DIR/fontello.woff" \
    "$FONT_DIR/fontello.woff2" \
    "$FONT_DIR/fontello.woff2" \
    "$SASS_DIR/partials/_fontello.scss" \
    "$SMILEYS_DIR" \
    "$SMILEYS_DIR/info.json" \
    "$SMILEYS_DIR/base/000a.gif" \
    "$CSS_DIR/main.css" \
    "$CSS_DIR/chat.css"\
    "$CSS_DIR/register.css"\
    "$JS_DIR/amcharts-all.js"
)

cd "$PROJECT_ROOT"

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
        printError "Please report for missing files at https://github.com/Deathangel908/djangochat/issues/new"
      fi
      exit 1
    else
        if [ "$1" = "remove_script" ]; then
            printf "\e[92mAll files are installed. Population succeeded\e[0;37;40m\n"
        else
            echo "All files are present"
        fi
    fi
}

printOut() {
    printf "\e[93m$1\e[0;37;40m\n"
}

printError() {
    >&2  printf "\e[91m$1\e[0;37;40m\n"
}

minify_js() {
    # prototype. doesn't resolve variables set through html file
    # also doesnt give a lot of benefict because of huge smileys_data.js file
    if ls "$PROJECT_ROOT/closure-compiler*.jar" 1> /dev/null 2>&1; then
        echo "files do exist"
    else
        echo "Closure compiler wasn't found, downloading it"
        mkdir "$TMP_DIR"
        curl -X GET https://dl.google.com/closure-compiler/compiler-latest.zip -o "$TMP_DIR/closure.zip"
        unzip "$TMP_DIR/closure.zip" "*.jar" -d "$PROJECT_ROOT"
    fi
    jar_file=`ls "$PROJECT_ROOT"/closure-compiler*.jar`
    java -jar "$jar_file"  --compilation_level ADVANCED_OPTIMIZATIONS  --js "$JS_DIR/base.js" --js "$JS_DIR/smileys_data.js" --js "$JS_DIR/chat.js" --js_output_file "$JS_DIR/chat-minified.js"

}
compile_sass() {
    printOut "Compiling sass files"
    if ! type "sassc" &> /dev/null; then
     if ! type "sass" &> /dev/null; then
       printError "Can't find sass nor sassc command in $PATH, please install it to be able to use stylesheets"
       exit 1
     else
       printError "sassc wasn't found trying to use sass instead"
     fi
    fi
    mkdir -p "$CSS_DIR"
    sass_files=($(ls "$SASS_DIR"/*.sass))
    cd "$SASS_DIR"
    for i in "${sass_files[@]}"
    do
        name_no_ext=$(basename $i .sass)
        echo "Compiling $i  to $CSS_DIR/$name_no_ext.css "
        if ! type "sassc" &> /dev/null; then
            sass "$i" "$CSS_DIR/$name_no_ext.css"
        else
            sassc "$i" "$CSS_DIR/$name_no_ext.css"
        fi
    done
    cd "$PROJECT_ROOT"
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
    zip -j -r "EX_FILE" ./screen_cast_extension/*
    printOut "Extension is created in $EX_FILE"
}


chp(){
 size=${#1}
 indent=$((20 - $size))
 printf "\e[1;37;40m$1\e[0;36;40m"
 for (( c=1; c<= $indent; c++))  ; do
 printf "."
 done
 printf "\e[0;33;40m$2\n\e[0;37;40m"
}


post_fontello_conf() {
    printOut "Creating fontello config"
    curl --silent --show-error --fail --form "config=@./config.json" --output .fontello http://fontello.com
    fontello_session=$(cat .fontello)
    url="http://fontello.com/`cat .fontello`"
    echo "Genereted fontello url: $url"
}

show_fontello_session() {
    fontello_session=$(cat .fontello)
    url="http://fontello.com/`cat .fontello`"
    printOut "Fonts url is: $url , open it mannualy if your browser doesn't launch automatically"
    python -mwebbrowser $url
}

download_fontello() {
    fontello_session=$(cat .fontello)
    printOut "Downloading fontello using fontello session '$fontello_session'"
    mkdir "$TMP_DIR"
    curl -X GET "http://fontello.com/$fontello_session/get" -o "$TMP_DIR/fonts.zip"
    unzip "$TMP_DIR/fonts.zip" -d "$TMP_DIR/fontello"
    dir=$(ls "$TMP_DIR/fontello")
    cp  "$TMP_DIR/fontello"/$dir/font/* "$FONT_DIR"
    cp  "$TMP_DIR/fontello"/$dir/css/fontello.css "$SASS_DIR/partials/_fontello.scss"
    cp "$TMP_DIR/fontello"/$dir/demo.html "$STATIC_DIR/demo.html"
    cp "$TMP_DIR/fontello"/$dir/config.json "$PROJECT_ROOT"

    if type "sed" &> /dev/null; then
        sed -i '1i\@charset "UTF-8";' "$SASS_DIR/partials/_fontello.scss"
    else
        printError "WARNING: sass would be compiled w/o encoding"
    fi
}

download_files() {
    # datepicker
    # use curl since it's part of windows git bash
    mkdir -p "$CSS_DIR"
    printOut "Downloading pikaday.js"
    curl -X GET https://dbushell.com/Pikaday/css/pikaday.css -o "$CSS_DIR/pikaday.css"
    curl -X GET https://raw.githubusercontent.com/dbushell/Pikaday/master/pikaday.js -o "$JS_DIR/pikaday.js"
    printOut "Downloading moment.js"
    curl -X GET http://momentjs.com/downloads/moment.js -o "$JS_DIR/moment.js"
    printOut "Downloading amcharts.js"
    curl -X GET https://www.amcharts.com/lib/3/amcharts.js -o "$JS_DIR/amcharts.js"
    curl -X GET https://www.amcharts.com/lib/3/pie.js -o "$JS_DIR/amcharts-pie.js"
    curl -X GET https://www.amcharts.com/lib/3/themes/dark.js -o "$JS_DIR/amcharts-dark.js"
    cat "$JS_DIR/amcharts.js" "$JS_DIR/amcharts-pie.js" "$JS_DIR/amcharts-dark.js" > "$JS_DIR/amcharts-all.js"
}

generate_smileys() {
    printOut "Generating smileys"
    python manage.py extract_cfpack
}

delete_tmp_dir() {
    if [  -d "$TMP_DIR" ]; then #if doen't exist
         printOut "Removing temporary files in $TMP_DIR"
         rm -rfv "$TMP_DIR"
    fi
}

if [ "$1" = "sass" ]; then
    compile_sass
elif [ "$1" = "get_fonts_session" ]; then
    post_fontello_conf
elif [ "$1" = "check_files" ]; then
    check_files
elif [ "$1" = "extension" ]; then
    zip_extension
elif [ "$1" = "download_files" ]; then
    download_files
elif [ "$1" = "smileys" ]; then
    generate_smileys
elif [ "$1" = "show_fonts_session" ]; then
    show_fontello_session
elif [ "$1" = "download_fonts" ]; then
    download_fontello
elif [ "$1" == "all" ]; then
    remove_old_files
    download_files
    generate_smileys
    post_fontello_conf
    download_fontello
    compile_sass
    check_files "remove_script"
else
 printf " \e[93mWellcome to pychat download manager, available commands are:\n"
 chp all "Downloads all content required for project"
 chp check_files "Verifies if all files are installed"
 chp sass "Compiles css"
 chp download_files "Downloads static files like amcharts.js "
 chp zip_extension "Creates zip acrhive for ChromeWebStore from \e[96mscreen_cast_extension \e[0;33;40mdirectory"
 printf " \e[93mFonts:\n\e[0;37;40mTo edit fonts execute\e[1;37;40m fonts_session\e[0;37;40m After you finish editing fonts in browser execute \e[1;37;40mdownload_fonts\e[0;37;40m\n"
 chp fonts_session "Creates fontello session from config.json and saves it to \e[96m .fontello \e[0;33;40mfile"
 chp get_fonts_session "Shows current used url for editing fonts"
 chp download_fontello "Downloads and extracts fonts from fontello to project"
fi


#wget http://jscolor.com/release/jscolor-1.4.4.zip -P $TMP_DIR && unzip $TMP_DIR/jscolor-1.4.4.zip -d $JS_DIR
# fontello
# http://www.mineks.com/assets/admin/css/fonts/glyphicons.social.pro/
# Sounds
#curl -L -o $TMP_DIR/sounds.zip https://www.dropbox.com/sh/0whi1oo782noit1/AAC-F14YggOFqx3DO3e0AvqGa?dl=1 && unzip $TMP_DIR/sounds.zip -d $SOUNDS_DIR

delete_tmp_dir