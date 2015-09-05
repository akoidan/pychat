#!/bin/bash

CONF_VERSION = '1d66cd9185dfb2d88f8e3d386e08be1968fa476d'

# defining the project structure
PROJECT_ROOT=`pwd`
TMP_DIR="/tmp/loaded_content"
STATIC_PARENT="$PROJECT_ROOT/story"
STATIC_DIR="$STATIC_PARENT/static"
JS_DIR="$STATIC_DIR/js"
CSS_DIR="$STATIC_DIR/css"
FONT_DIR="$STATIC_DIR/font"
SOUNDS_DIR="$STATIC_DIR/sounds"

# Implementing installed files
files[0]="$STATIC_DIR/favicon.ico"
files[1]="$SOUNDS_DIR/ChatOutgoing.wav"
files[2]="$SOUNDS_DIR/ChatIncoming.wav"
files[3]="$SOUNDS_DIR/ChatLogin.wav"
files[4]="$SOUNDS_DIR/ChatLogout.wav"
files[5]="$CSS_DIR/pikaday.css"
files[6]="$JS_DIR/pikaday.js"
files[7]="$JS_DIR/moment.js"
files[8]="$CSS_DIR/fontello.css"
files[9]="$FONT_DIR/fontello.eot"
files[10]="$FONT_DIR/fontello.svg"
files[11]="$FONT_DIR/fontello.ttf"
files[12]="$FONT_DIR/fontello.woff"

# Deleting all content creating empty dirs
for path in "${files[@]}" ; do
  if [ -f $path ]; then
   rm $path
  fi
done


# remove tmp directory afterword if It didn't exist
if [ -d "$TMP_DIR" ]; then
    clean_tmp_dir=0;
  else
    mkdir -p $TMP_DIR
    clean_tmp_dir=1;
fi

cd $PROJECT_ROOT

git clone https://github.com/Deathangel908/djangochat-config $TMP_DIR/chatconf
git --git-dir=$TMP_DIR/chatconf/.git --work-tree=$TMP_DIR/chatconf/ checkout $CONF_VERSION
cp -r $TMP_DIR/chatconf/static $STATIC_PARENT

# datepicker
wget http://dbushell.github.io/Pikaday/css/pikaday.css -P $CSS_DIR
wget https://raw.githubusercontent.com/dbushell/Pikaday/master/pikaday.js -P $JS_DIR
wget http://momentjs.com/downloads/moment.js -P $JS_DIR


#wget http://jscolor.com/release/jscolor-1.4.4.zip -P $TMP_DIR && unzip $TMP_DIR/jscolor-1.4.4.zip -d $JS_DIR
# fontello
# http://www.mineks.com/assets/admin/css/fonts/glyphicons.social.pro/
# Sounds
#curl -L -o $TMP_DIR/sounds.zip https://www.dropbox.com/sh/0whi1oo782noit1/AAC-F14YggOFqx3DO3e0AvqGa?dl=1 && unzip $TMP_DIR/sounds.zip -d $SOUNDS_DIR

# Checking if all files are loaded
failed_count=0
for path in "${files[@]}" ; do
  if [ ! -f $path ]; then
    ((failed_count++))
     >&2 echo "Can't find file: $path"
    failed_items[$failed_count]=$path
  fi
done

# Fetch files from dropbox if link failed
failed_count_second_attempt=0
if [[ $failed_count > 0 ]]; then
  echo "Tring to fetch broken resources from dropbox"
  wget https://www.dropbox.com/sh/p9efgb46pyl3hj3/AABIDVckht4SGZUDAnU7dlD7a?dl=1 -O $TMP_DIR/static.zip &&
  unzip $TMP_DIR/static.zip -d $TMP_DIR/static
  for path_failed in "${failed_items[@]}" ; do
    dropbox_path="${path_failed#$STATIC_DIR}"
    tmp_fetched_db_file="$TMP_DIR/static/$dropbox_path"
    cp $tmp_fetched_db_file $path_failed
    if [ ! -f $path_failed ]; then
      ((failed_count_second_attempt++))
      failed_items_second_attempt[$failed_count_second_attempt]=$dropbox_path
    fi
  done
fi

if [ $clean_tmp_dir -eq 1 ] ; then
  rm -rf $TMP_DIR
fi

if [[ $failed_count_second_attempt > 0 ]]; then
  for path_failed2 in "${failed_items_second_attempt[@]}" ; do
    >&2 echo "$path_failed2 wasn't found in dropbox directory"
  done
  >&2 echo "Please report for missing files at https://github.com/Deathangel908/djangochat/issues/new"
  exit 1
else
  echo "Installation succeeded"
fi