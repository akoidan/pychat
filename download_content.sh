#!/bin/bash
PROJECT_ROOT='.'

cd $PROJECT_ROOT

# IShout.js
realPython=$(readlink -f $(which python))
(sudo ln -sf $(which python2) $(which python) &&
sudo npm install ishout.js
sudo ln -sf $realPython $(which python)) ||
curl -L -o ishout.js.zip https://www.dropbox.com/sh/m0np8p9f7c9cf3k/AACGEDrkpspbSocyQP0SaVk-a?dl=1 && unzip ishout.js.zip -d $PROJECT_ROOT/node_modules


# Fonts
mkdir $PROJECT_ROOT/story/static/fonts/
wget https://github.com/twbs/bootstrap/raw/master/fonts/glyphicons-halflings-regular.eot -P $PROJECT_ROOT/story/static/fonts/
wget https://raw.githubusercontent.com/twbs/bootstrap/master/fonts/glyphicons-halflings-regular.svg -P $PROJECT_ROOT/story/static/fonts/
wget https://github.com/twbs/bootstrap/raw/master/fonts/glyphicons-halflings-regular.ttf -P $PROJECT_ROOT/story/static/fonts/
wget https://github.com/twbs/bootstrap/raw/master/fonts/glyphicons-halflings-regular.woff -P $PROJECT_ROOT/story/static/fonts/

# JavaScript
wget https://raw.githubusercontent.com/twbs/bootstrap/master/dist/js/bootstrap.js -P $PROJECT_ROOT/story/static/js/
wget https://raw.githubusercontent.com/mathiasbynens/he/master/he.js -P $PROJECT_ROOT/story/static/js/
wget http://code.jquery.com/jquery-2.1.3.min.js -O $PROJECT_ROOT/story/static/js/jquery.js

# CSS
wget https://raw.githubusercontent.com/marcoceppi/bootstrap-glyphicons/master/css/bootstrap.icon-large.css -O $PROJECT_ROOT/story/static/css/bootstrap-glyphicons.css
wget https://raw.githubusercontent.com/mzyy94/HONDA-3D-WebGL-demo/master/stylesheets/cssload.css -O $PROJECT_ROOT/story/static/css/confirm-email.css

# Sounds
mkdir $PROJECT_ROOT/story/static/sounds
curl -L -o /tmp/sounds.zip https://www.dropbox.com/sh/0whi1oo782noit1/AAC-F14YggOFqx3DO3e0AvqGa?dl=1 && unzip /tmp/sounds.zip -d $PROJECT_ROOT/story/static/sounds/

folders[1]="$PROJECT_ROOT/story/static/fonts/glyphicons-halflings-regular.svg"
folders[2]="$PROJECT_ROOT/story/static/fonts/glyphicons-halflings-regular.eot"
folders[3]="$PROJECT_ROOT/story/static/fonts/glyphicons-halflings-regular.ttf"
folders[4]="$PROJECT_ROOT/story/static/fonts/glyphicons-halflings-regular.woff"
folders[5]="$PROJECT_ROOT/story/static/js/jquery.js"
folders[6]="$PROJECT_ROOT/story/static/js/bootstrap.js"
folders[7]="$PROJECT_ROOT/story/static/js/he.js"
folders[8]="$PROJECT_ROOT/story/static/css/confirm-email.css"
folders[9]="$PROJECT_ROOT/story/static/css/bootstrap-glyphicons.css"
folders[10]="$PROJECT_ROOT/story/static/sounds/ChatOutgoing.wav"
folders[11]="$PROJECT_ROOT/story/static/sounds/ChatIncoming.wav"
folders[12]="$PROJECT_ROOT/node_modules/ishout.js/server.js"

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