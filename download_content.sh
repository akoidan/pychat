#!/bin/bash

# defining the project structure
PROJECT_ROOT=`pwd`
TMP_DIR="/tmp/loaded content/"
STATIC_DIR="$PROJECT_ROOT/story/static/"
JS_DIR="$STATIC_DIR/js/"
CSS_DIR="$STATIC_DIR/css/"
SOUNDS_DIR="$STATIC_DIR/sounds/"
FONTS_DIR="$STATIC_DIR/fonts/"
NODE_DIR="$PROJECT_ROOT/node_modules"


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
files[11]="$PROJECT_ROOT/node_modules/ishout.js/server.js"


# Deleting all content creating empty dirs
rm -rf $SOUNDS_DIR
rm -rf $NODE_DIR
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


# IShout.js
command -v npm && {
  echo "Installing ishout.js, this can take a while" ;
  export PYTHON=python2 ;
  npm install ishout.js ;
  npm_exit_status=$? ;
  # The common issue when access denied for ~/.npm directory
  if [[ $npm_exit_status == 3 ]] ; then
    echo "Seems like you don't have permissions to ~/.npm directory, trying to change it"
    sudo chown -R $(whoami) ~/.npm
    npm install ishout.js
  fi;
  unset PYTHON
}
if [ ! -f "$PROJECT_ROOT/node_modules/ishout.js/server.js" ]; then
    echo 'Installing ishout.js has failed, trying to install it manualy'
    rm -rf $NODE_DIR
    curl -L -o $TMP_DIR/ishout.js.zip https://www.dropbox.com/sh/m0np8p9f7c9cf3k/AACGEDrkpspbSocyQP0SaVk-a?dl=1 && unzip $TMP_DIR/ishout.js.zip -d $NODE_DIR
fi


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
wget http://jscolor.com/release/jscolor-1.4.4.zip -P /tmp && unzip $TMP_DIR/jscolor-1.4.4.zip -d $JS_DIR


# Sounds
curl -L -o $TMP_DIR/sounds.zip https://www.dropbox.com/sh/0whi1oo782noit1/AAC-F14YggOFqx3DO3e0AvqGa?dl=1 && unzip $TMP_DIR/sounds.zip -d $SOUNDS_DIR


# Checking if all files are loaded
status="ok"
for path in "${files[@]}" ; do
  if [ ! -f $path ]; then
    status="fail"
    echo "installing $path has failed, download it manually"
  fi
done


if [ $clean_tmp_dir -eq 1 ] ; then
  rm -rf $TMP_DIR
fi


if [[ $status == "ok" ]] ; then
  echo "Installation succeded"
else
  echo "Some files haven't been installed, try to install it manually from from https://www.dropbox.com/sh/tr5fr7rl93aghfm/AAAb9obWh6yerSEcmqnGF0NBa?dl=0"
  exit 1
fi

