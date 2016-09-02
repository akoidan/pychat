#!/bin/bash

CONF_REPOSITORY="https://github.com/Deathangel908/djangochat-config"

CONF_VERSION='f930e519dea693c1757482c959257dc688c012d2'

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
VAL_DIR="$STATIC_DIR/valentine"
IMAGES_DIR="$STATIC_DIR/images"
SASS_DIR="$STATIC_DIR/sass"
# Implementing installed files
declare -a files=(\
    "$IMAGES_DIR/favicon.ico" \
    "$SOUNDS_DIR/ChatOutgoing.wav" \
    "$SOUNDS_DIR/ChatIncoming.wav" \
    "$SOUNDS_DIR/ChatLogin.wav" \
    "$SOUNDS_DIR/ChatLogout.wav" \
    "$CSS_DIR/pikaday.css" \
    "$JS_DIR/pikaday.js" \
    "$JS_DIR/moment.js" \
    "$SASS_DIR/fontello/_fontello.scss" \
    "$FONT_DIR/fontello.eot" \
    "$FONT_DIR/fontello.svg" \
    "$FONT_DIR/fontello.ttf" \
    "$FONT_DIR/fontello.woff" \
    "$FONT_DIR/fontello.woff2" \
    "$FONT_DIR/OpenSans.ttf" \
    "$FONT_DIR/Oswald.ttf" \
    "$JS_DIR/smileys_data.js"
    "$IMAGES_DIR/ajaxStatus.gif" \
    "$IMAGES_DIR/asphalt.jpg" \
    "$IMAGES_DIR/no_ava.png" \
    "$CSS_DIR/main.css" \
    "$CSS_DIR/chat.css"\
    "$CSS_DIR/register.css"\
    "$VAL_DIR/Love_and_Passion.ttf"\
    "$VAL_DIR/teddy.gif"\
    "$VAL_DIR/v2.ttf"\
    "$VAL_DIR/videoplayback.mp3"\
    "$JS_DIR/amcharts-all.js"
)

cd "$PROJECT_ROOT"

compile_sass() {
    if ! type "sass" &> /dev/null; then
     >&2 echo "You need to install sass to be able to use stylesheets"
     exit 1
    fi
    sass_files=($(ls "$SASS_DIR"/*.sass))
    echo "Compiling sass files: $sass_files"
    cd "$SASS_DIR"
    for i in "${sass_files[@]}"
    do
        name_no_ext=$(basename $i .sass)
        sass --no-cache --update "$i":"$CSS_DIR/$name_no_ext.css" --style compressed
    done
    cd "$PROJECT_ROOT"
}

if [ $1 = "sass" ]; then
    compile_sass
    exit 0
fi

# Deleting all content creating empty dirs
for path in "${files[@]}" ; do
  if [ -f "$path" ]; then
   rm -v "$path"
   elif  [ -d "$path" ]; then
   rm -rv "$path"
  fi
done

mkdir -pv "$TMP_DIR"

git clone "$CONF_REPOSITORY" "$TMP_DIR/chatconf"
git --git-dir="$TMP_DIR/chatconf/.git" --work-tree="$TMP_DIR/chatconf/" checkout $CONF_VERSION
cp -r "$TMP_DIR/chatconf/static" "$STATIC_PARENT"
mv "$CSS_DIR/fontello.css" "$SASS_DIR/fontello/_fontello.scss"
mv "$CSS_DIR/fontello-embedded.css" "$SASS_DIR/fontello/_fontello-embedded.scss"
mv "$CSS_DIR/fontello-codes.css" "$SASS_DIR/fontello/_fontello-codes.scss"
mv "$CSS_DIR/fontello-ie7.css" "$SASS_DIR/fontello/_fontello-ie7.scss"
mv "$CSS_DIR/fontello-ie7-codes.css" "$SASS_DIR/fontello/_fontello-ie7-codes.scss"

compile_sass

# datepicker
# use curl since it's part of windows git bash
curl -X GET http://dbushell.github.io/Pikaday/css/pikaday.css -o "$CSS_DIR/pikaday.css"
curl -X GET https://raw.githubusercontent.com/dbushell/Pikaday/master/pikaday.js -o "$JS_DIR/pikaday.js"
curl -X GET http://momentjs.com/downloads/moment.js -o "$JS_DIR/moment.js"
curl -X GET https://www.amcharts.com/lib/3/amcharts.js -o "$JS_DIR/amcharts.js"
curl -X GET https://www.amcharts.com/lib/3/pie.js -o "$JS_DIR/amcharts-pie.js"
curl -X GET https://www.amcharts.com/lib/3/themes/dark.js -o "$JS_DIR/amcharts-dark.js"

cat "$JS_DIR/amcharts.js" "$JS_DIR/amcharts-pie.js" "$JS_DIR/amcharts-dark.js" > "$JS_DIR/amcharts-all.js"

#wget http://jscolor.com/release/jscolor-1.4.4.zip -P $TMP_DIR && unzip $TMP_DIR/jscolor-1.4.4.zip -d $JS_DIR
# fontello
# http://www.mineks.com/assets/admin/css/fonts/glyphicons.social.pro/
# Sounds
#curl -L -o $TMP_DIR/sounds.zip https://www.dropbox.com/sh/0whi1oo782noit1/AAC-F14YggOFqx3DO3e0AvqGa?dl=1 && unzip $TMP_DIR/sounds.zip -d $SOUNDS_DIR

# Checking if all files are loaded
failed_count=0
for path in "${files[@]}" ; do
  if [ ! -f "$path" ] && [ ! -d "$path" ]; then #if doen't exist
    ((failed_count++))
     >&2 echo "Can't find file: $path"
    failed_items[$failed_count]="$path"
  fi
done

# Fetch files from dropbox if link failed
failed_count_second_attempt=0
if [[ $failed_count > 0 ]]; then
  echo "Tring to fetch broken resources from dropbox"
  curl -L https://www.dropbox.com/sh/p9efgb46pyl3hj3/AABIDVckht4SGZUDAnU7dlD7a?dl=1 -o "$TMP_DIR/static.zip" &&
  unzip "$TMP_DIR/static.zip" -d "$TMP_DIR/static"
  for path_failed in "${failed_items[@]}" ; do
    dropbox_path="${path_failed#$STATIC_DIR}"
    tmp_fetched_db_file="$TMP_DIR/static/$dropbox_path"
    cp "$tmp_fetched_db_file" "$path_failed"
    if [ ! -f "$path_failed" ]; then
      ((failed_count_second_attempt++))
      failed_items_second_attempt[$failed_count_second_attempt]="$dropbox_path"
    fi
  done
fi

echo "removing tmp directory $TMP_DIR"
rm -rf "$TMP_DIR"

if [[ $failed_count_second_attempt > 0 ]]; then
  for path_failed2 in "${failed_items_second_attempt[@]}" ; do
    >&2 echo "$path_failed2 wasn't found in dropbox directory"
  done
  >&2 echo "Please report for missing files at https://github.com/Deathangel908/djangochat/issues/new"
  exit 1
else
  echo "Installation succeeded"
fi
