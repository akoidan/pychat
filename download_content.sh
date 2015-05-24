#!/bin/bash

# defining the project structure
PROJECT_ROOT=`pwd`
TMP_DIR="/tmp/loaded_content"
STATIC_DIR="$PROJECT_ROOT/story/static"
JS_DIR="$STATIC_DIR/js"
CSS_DIR="$STATIC_DIR/css"
SOUNDS_DIR="$STATIC_DIR/sounds"
FONTS_DIR="$STATIC_DIR/fonts"

# Implementing installed files
files[1]="$FONTS_DIR/glyphicons-halflings-regular.woff"
files[2]="$FONTS_DIR/glyphicons-halflings-regular.woff2"
files[3]="$JS_DIR/jquery.js"
files[4]="$JS_DIR/jscolor/jscolor.js"
files[5]="$SOUNDS_DIR/ChatOutgoing.wav"
files[6]="$SOUNDS_DIR/ChatIncoming.wav"
files[7]="$CSS_DIR/bootstrap-datepicker.min.css"
files[8]="$JS_DIR/bootstrap-datepicker.min.js"
files[9]="$CSS_DIR/bootstrap.min.css"
files[10]="$JS_DIR/bootstrap.min.js"
files[11]="$JS_DIR/jquery.cookie.js"
files[5]="$SOUNDS_DIR/ChatLogin.wav"
files[6]="$SOUNDS_DIR/ChatLogout.wav"


# Deleting all content creating empty dirs
rm -rf $SOUNDS_DIR
rm -rf $FONTS_DIR
for path in "${files[@]}" ; do
  if [ -f $path ]; then
   rm $path
  fi
done
mkdir $SOUNDS_DIR
mkdir $FONTS_DIR

# remove tmp directory afterword if It didn't exist
if [ -d "$TMP_DIR" ]; then
    clean_tmp_dir=0;
  else
    mkdir -p $TMP_DIR
    clean_tmp_dir=1;
fi

cd $PROJECT_ROOT

# bootstrap
wget https://github.com/twbs/bootstrap/releases/download/v3.3.4/bootstrap-3.3.4-dist.zip -O $TMP_DIR/bootstrap.zip &&
unzip $TMP_DIR/bootstrap.zip -d $TMP_DIR/bootstrap/
cp $TMP_DIR/bootstrap/bootstrap-3.3.4-dist/css/bootstrap.min.css $CSS_DIR/bootstrap.min.css
cp $TMP_DIR/bootstrap/bootstrap-3.3.4-dist/fonts/glyphicons-halflings-regular.woff $FONTS_DIR/glyphicons-halflings-regular.woff
cp $TMP_DIR/bootstrap/bootstrap-3.3.4-dist/fonts/glyphicons-halflings-regular.woff2 $FONTS_DIR/glyphicons-halflings-regular.woff2
cp $TMP_DIR/bootstrap/bootstrap-3.3.4-dist/js/bootstrap.min.js $JS_DIR/bootstrap.min.js
#datepicker
wget https://github.com/eternicode/bootstrap-datepicker/blob/master/dist/css/bootstrap-datepicker.min.css#L8 -O $CSS_DIR/bootstrap-datepicker.min.css
wget https://raw.githubusercontent.com/eternicode/bootstrap-datepicker/master/dist/js/bootstrap-datepicker.min.js -O $JS_DIR/bootstrap-datepicker.min.js


# JavaScript
#wget https://raw.githubusercontent.com/mathiasbynens/he/master/he.js -P $JS_DIR/
wget http://code.jquery.com/jquery-2.1.3.min.js -O $JS_DIR/jquery.js
rm -rf $JS_DIR/jscolor
wget http://jscolor.com/release/jscolor-1.4.4.zip -P $TMP_DIR && unzip $TMP_DIR/jscolor-1.4.4.zip -d $JS_DIR
wget https://raw.githubusercontent.com/carhartl/jquery-cookie/master/src/jquery.cookie.js -P $JS_DIR/

# Sounds
curl -L -o $TMP_DIR/sounds.zip https://www.dropbox.com/sh/0whi1oo782noit1/AAC-F14YggOFqx3DO3e0AvqGa?dl=1 && unzip $TMP_DIR/sounds.zip -d $SOUNDS_DIR


# Checking if all files are loaded
failed_count=0
for path in "${files[@]}" ; do
  if [ ! -f $path ]; then
    ((failed_count++))
    failed_items[$failed_count]=$path
  fi
done

# Fetch files from dropbox if link failed
failed_count_second_attempt=0
if [[ $failed_count > 0 ]]; then
  >&2 echo "Some links have been broken, fetching resources from dropbox"
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
