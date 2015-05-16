![python](https://img.shields.io/badge/python-2.7%2C%203.x-blue.svg) ![python](https://img.shields.io/badge/django-1.7-blue.svg) [![Scrutinizer Build pass](https://scrutinizer-ci.com/g/Deathangel908/djangochat/badges/build.png)](https://scrutinizer-ci.com/g/Deathangel908/djangochat) [![Scrutinizer Code Quality](https://scrutinizer-ci.com/g/Deathangel908/djangochat/badges/quality-score.png?b=master)](https://scrutinizer-ci.com/g/Deathangel908/djangochat/?branch=master) [![Code Health](https://landscape.io/github/Deathangel908/djangochat/master/landscape.svg?style=flat)](https://landscape.io/github/Deathangel908/djangochat/master) [![Codacy Badge](https://www.codacy.com/project/badge/b508fef8efba4a5f8b5e8411c0803af5)](https://www.codacy.com/public/nightmarequake/djangochat)

A simple chat written in django with drealtime
==========
To run this you need:

1. Python3 or Python2, both are supported
2. sudo pip install -r requirements.txt 
3. Linux packages
 1. redis-server # ArchLinux `pacman -S community/redis`, Ubuntu `add-apt-repository -y ppa:rwky/redis` `apt-get install -y redis-server`
 2. nodejs and npm# ArchLinux `pacman -S community/nodejs` Ubuntu `apt-get install nodejs` `apt-get install npm`
4. Configure server  
 1. Choose DATABASES in Chat/settings.py if needed and run `sh syncdb.sh` #Chat uses SQLite by default
 2. Change HOST_IP in Chat/settings.py to yours, it tells where messages should go from a client
5. Download static content and IShout.js
 1. `sh download_content.sh`
6. Start the chat 
 1. `redis-server` 
 2. ArchLinux `node ./node_modules/ishout.js/server.js` Ubuntu `nodejs ./node_modules/ishout.js/server.js` # npm's ishout.js directory
 3. `python manage.py runserver 0.0.0.0:80000`

#TODO
* gender check
* login dropdown is broken
* add space beetween elements in row dropdown
* check profile save button uses only bootsrap
* add chat rooms
* implement smiles
* Add languages for menu.
* Gradient text disappear on top
* move download_content and smiles to manage.py command
* add check whether redis and nodejs are running 
