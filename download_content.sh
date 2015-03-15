#!/bin/bash

# defining the project structure
PROJECT_ROOT=`pwd`
STATIC_DIR="$PROJECT_ROOT/story/static/"
cd $PROJECT_ROOT

# IShout.js
(alias python='python2' &&
sudo npm install ishout.js
unalias python) ||
curl -L -o ishout.js.zip https://www.dropbox.com/sh/m0np8p9f7c9cf3k/AACGEDrkpspbSocyQP0SaVk-a?dl=1 && unzip ishout.js.zip -d $PROJECT_ROOT/node_modules

#Bootsrap
mkdir $STATIC_DIR/fonts/
#wget https://github.com/twbs/bootstrap/raw/master/fonts/glyphicons-halflings-regular.eot -P $STATIC_DIR/fonts/
#wget https://raw.githubusercontent.com/twbs/bootstrap/master/fonts/glyphicons-halflings-regular.svg -P $STATIC_DIR/fonts/
#wget https://github.com/twbs/bootstrap/raw/master/fonts/glyphicons-halflings-regular.ttf -P $STATIC_DIR/fonts/
wget https://github.com/twbs/bootstrap/raw/master/fonts/glyphicons-halflings-regular.woff -P $STATIC_DIR/fonts/
wget https://raw.githubusercontent.com/twbs/bootstrap/master/dist/js/bootstrap.min.js -P $STATIC_DIR/js/
wget https://raw.githubusercontent.com/twbs/bootstrap/master/dist/css/bootstrap.min.css -P $STATIC_DIR/css/
wget https://github.com/eternicode/bootstrap-datepicker/blob/master/dist/css/bootstrap-datepicker.min.css#L8 -P $STATIC_DIR/css/
wget https://raw.githubusercontent.com/eternicode/bootstrap-datepicker/master/dist/js/bootstrap-datepicker.min.js -P $STATIC_DIR/js/

# JavaScript
#wget https://raw.githubusercontent.com/twbs/bootstrap/master/dist/js/bootstrap.js -P $STATIC_DIR/js/
#wget https://raw.githubusercontent.com/mathiasbynens/he/master/he.js -P $STATIC_DIR/js/
wget http://code.jquery.com/jquery-2.1.3.min.js -O $STATIC_DIR/js/jquery.js
wget http://jscolor.com/release/jscolor-1.4.4.zip -P /tmp && unzip /tmp/jscolor-1.4.4.zip -d $STATIC_DIR/js/

# CSS
wget https://raw.githubusercontent.com/marcoceppi/bootstrap-glyphicons/master/css/bootstrap.icon-large.css -O $STATIC_DIR/css/bootstrap-glyphicons.css
#wget https://raw.githubusercontent.com/mzyy94/HONDA-3D-WebGL-demo/master/stylesheets/cssload.css -O $STATIC_DIR/css/confirm-email.css

# Sounds
mkdir $STATIC_DIR/sounds
curl -L -o /tmp/sounds.zip https://www.dropbox.com/sh/0whi1oo782noit1/AAC-F14YggOFqx3DO3e0AvqGa?dl=1 && unzip /tmp/sounds.zip -d $STATIC_DIR/sounds/

# Check if all content is loaded
#folders[1]="$STATIC_DIR/fonts/glyphicons-halflings-regular.svg"
#folders[2]="$STATIC_DIR/fonts/glyphicons-halflings-regular.eot"
#folders[3]="$STATIC_DIR/fonts/glyphicons-halflings-regular.ttf"
folders[4]="$STATIC_DIR/fonts/glyphicons-halflings-regular.woff"
folders[5]="$STATIC_DIR/js/jquery.js"
folders[6]="$STATIC_DIR/js/jscolor/jscolor.js"
folders[8]="$STATIC_DIR/css/confirm-email.css"
folders[9]="$STATIC_DIR/css/bootstrap-glyphicons.css"
folders[10]="$STATIC_DIR/sounds/ChatOutgoing.wav"
folders[11]="$STATIC_DIR/sounds/ChatIncoming.wav"
folders[12]="$STATIC_DIR/css/bootstrap-datepicker.min.css"
folders[13]="$STATIC_DIR/js/bootstrap-datepicker.min.js"
folders[14]="$STATIC_DIR/css/bootstrap.min.css"
folders[15]="$STATIC_DIR/js/bootstrap.min.js"
folders[16]="$PROJECT_ROOT/node_modules/ishout.js/server.js"

status="ok"
for path in "${folders[@]}" ; do
  if [ ! -f $path ]; then
    status="fail"
    echo "installing $path has failed, download it manually"
  fi
done

if [[ $status == "ok" ]] ; then
  echo "Installation succeded"
else
  echo "Some files haven't been installed, try to install it manually from from https://www.dropbox.com/sh/tr5fr7rl93aghfm/AAAb9obWh6yerSEcmqnGF0NBa?dl=0"
  exit 1
fi