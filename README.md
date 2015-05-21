![python](https://img.shields.io/badge/python-2.7%2C%203.x-blue.svg) ![python](https://img.shields.io/badge/django-1.7-blue.svg) [![Scrutinizer Build pass](https://scrutinizer-ci.com/g/Deathangel908/djangochat/badges/build.png)](https://scrutinizer-ci.com/g/Deathangel908/djangochat) [![Scrutinizer Code Quality](https://scrutinizer-ci.com/g/Deathangel908/djangochat/badges/quality-score.png?b=master)](https://scrutinizer-ci.com/g/Deathangel908/djangochat/?branch=master) [![Code Health](https://landscape.io/github/Deathangel908/djangochat/master/landscape.svg?style=flat)](https://landscape.io/github/Deathangel908/djangochat/master) [![Codacy Badge](https://www.codacy.com/project/badge/b508fef8efba4a5f8b5e8411c0803af5)](https://www.codacy.com/public/nightmarequake/djangochat)

A simple chat written in django via WebsSockets
==========
To run this you need:

1. Install dependencies:
 1. python packages: `pip install -r requirements.txt`
 2. redis-server: archLinux `pacman -S community/redis`, Ubuntu `add-apt-repository -y ppa:rwky/redis` `apt-get install -y redis-server`
 3. static content: `sh download_content.sh`
 4. create the database: `python manage.py init_db`
2. Start the chat 
 1. Start session holder: `redis-server`
 2. Start WebSocket listener: `python manage.py start_server`
 3. Start the Chat: `python manage.py runserver 0.0.0.0:80000`

#TODO
* show system messages on navbar
* allow to edit username for anonymous
* don't refresh userlist on closing tab if there's an open tab 
* remove connections set, there's a lot of issues like when user close a single tab, and there're still open websockets but the user is missing frm list already
* user private messages sent only to single websocket got by username, thus a user missed messages if there're 2+ tabs
* show if user's reconnecting
* since post to 10 getmessages loads 1st, username is not set and self messages writes as others colors
* tornadoi2
* add logger
* deploy on server
* right room width (add space to roght size from scroll if userdlist is closed)
* on start 10 messages includes foreign private ones 
* timezone
* show gender icon in userlist 
* make login dropdown smaller
* check profile save button uses only bootsrap
* add chat rooms
* implement smiles
* Gradient text disappear on top