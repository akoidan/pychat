![python](https://img.shields.io/badge/python-2.7%2C%203.x-blue.svg) ![python](https://img.shields.io/badge/django-1.7-blue.svg) [![Scrutinizer Build pass](https://scrutinizer-ci.com/g/Deathangel908/djangochat/badges/build.png)](https://scrutinizer-ci.com/g/Deathangel908/djangochat) [![Scrutinizer Code Quality](https://scrutinizer-ci.com/g/Deathangel908/djangochat/badges/quality-score.png?b=master)](https://scrutinizer-ci.com/g/Deathangel908/djangochat/?branch=master) [![Code Health](https://landscape.io/github/Deathangel908/djangochat/master/landscape.svg?style=flat)](https://landscape.io/github/Deathangel908/djangochat/master) [![Codacy Badge](https://www.codacy.com/project/badge/b508fef8efba4a5f8b5e8411c0803af5)](https://www.codacy.com/public/nightmarequake/djangochat)
Web chat based on WebSockets.
================================================

Basically written in **Python** with [django](https://www.djangoproject.com/) it uses asynchronous web framework [Tornado](http://www.tornadoweb.org/) for handling realtime messages. Broadcasting messages are being sent by means of [redis](http://redis.io/) [pub/sub](http://en.wikipedia.org/wiki/Publish%E2%80%93subscribe_pattern) feature using Python [tornado-redis](https://github.com/leporo/tornado-redis) backend. It can be run on both **Windows** and **Linux** and tested on **Python 2.7** and **Python 3.x**

Get dependencies:
================
 1. *Python2.7* or *Python 3.x* both are supported
 2. *pip* for getting dependencies
 3. *redis* for holding session and pubsub messages
 4. Get python packages
 4. Create the database
 6. Copy static content (audio, fonts...)

Windows:
 1. Install python with pip https://www.python.org/downloads/
 2. Add pip and python to PATH variable
 3. Install redis from https://github.com/rgl/redis/downloads
 4. Open cmd as Administrator and run `pip install -r requirements.txt`
 5. Copy https://github.com/Deathangel908/djangochat-config (see 3rd step for linux) revision static files to story/static directory
 6. Open cmd and run `python manage.py init_db` from project directory

Ubuntu:
 1. `apt-get install python`
 2. `apt-get install pip`
 3. `add-apt-repository -y ppa:rwky/redis` `apt-get install -y redis-server`

Archlinux:
 1. `pacman -S python`
 2. `pacman -S pip`
 3. `pacman -S community/redis`

Next steps are common for Linux:
 1. `pip install -r requirements.txt`
 2. `python manage.py init_db`
 3. `git clone https://github.com/Deathangel908/djangochat-config && cd djangochat-config && git checkout ea831979d3c0d569ecb7da44eab6ea2cbebc0677 && cp -r ./static ../story/`

Start the chat:
==============
 1. Start session holder: `redis-server`
 2. Start WebSocket listener: `python manage.py start_server`
 3. Start the Chat: `python manage.py runserver 0.0.0.0:80000`

#TODO
* file upload http://stackoverflow.com/a/14605593/3872976
* load messages top is completely broken after removing jquery
* show user profile onclick gender icon
* add periodic refresh user task -> runs every N hours. publish message to online channel, gets all usernames in N seconds, then edits connection in redis
* create tornado class in tornadoapp, put there all tornado logic
* logger
* change anonymous message color
* Use `localStorage` to store messages and don't load it twice and check if there are new messages after connection lost
 also check id when appedning message to top to prevent double fire issue, append message to bottom if user went offline
* select user in userlist by changing its color to yellow - itself, anonymous ...
* USE init or on_open
* show system messages on navbar
* don't refresh userlist on closing tab if there's an open tab
* show if user's reconnecting
* tornadoi2
* add logger
* deploy on server
* timezone
* show gender icon in userlist
* add chat rooms
* implement smiles
* Gradient text disappear on top