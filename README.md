![python](https://img.shields.io/badge/python-2.7%2C%203.x-blue.svg) ![python](https://img.shields.io/badge/django-1.7--1.9-blue.svg) [![Scrutinizer Build pass](https://scrutinizer-ci.com/g/Deathangel908/djangochat/badges/build.png)](https://scrutinizer-ci.com/g/Deathangel908/djangochat) [![Scrutinizer Code Quality](https://scrutinizer-ci.com/g/Deathangel908/djangochat/badges/quality-score.png?b=master)](https://scrutinizer-ci.com/g/Deathangel908/djangochat/?branch=master) [![Code Health](https://landscape.io/github/Deathangel908/djangochat/master/landscape.svg?style=flat)](https://landscape.io/github/Deathangel908/djangochat/master) [![Codacy Badge](https://www.codacy.com/project/badge/b508fef8efba4a5f8b5e8411c0803af5)](https://www.codacy.com/public/nightmarequake/djangochat)
Web chat based on WebSockets.
================================================

Basically written in **Python** with [django](https://www.djangoproject.com/) it uses asynchronous web framework [Tornado](http://www.tornadoweb.org/) for handling realtime messages. Broadcasting messages are being sent by means of [redis](http://redis.io/) [pub/sub](http://en.wikipedia.org/wiki/Publish%E2%80%93subscribe_pattern) feature using Python [tornado-redis](https://github.com/leporo/tornado-redis) backend. It can be run on both **Windows** and **Linux** and tested on **Python 2.7** and **Python 3.x**


[Live demo](http://pychat.org/)
================


Get dependencies:
================
 1. *Python2.7* or *Python 3.x* both are supported
 2. *pip* for getting dependencies
 3. *redis* for holding session and pubsub messages
 4. Get python packages
 4. Create the database
 6. Copy static content (audio, fonts...)

Windows:
 1. Install [python](https://www.python.org/downloads/) with pip 
 2. Add pip and python to PATH variable
 3. Install [redis](https://github.com/rgl/redis/downloads) 
 4. Add git's bash commands (for example "C:\Program Files\Git\usr\bin;C:\Program Files\Git\bin") to PATH variable

Ubuntu:
 1. `apt-get install python`
 2. `apt-get install pip`
 3. `add-apt-repository -y ppa:rwky/redis` `apt-get install -y redis-server`

Archlinux:
 1. `pacman -S python`
 2. `pacman -S pip`
 3. `pacman -S community/redis`

Next steps are common:
 1. `pip install -r requirements.txt`
 2. `python manage.py init_db`
 3. `sh download_content.sh`

Start the chat:
==============
 1. Start session holder: `redis-server`
 2. Start WebSocket listener: `python manage.py start_tornado`
 3. Start the Chat: `python manage.py runsslserver 0.0.0.0:8000`
 4. Open in browser http*s*://127.0.0.1:8000

# TODO
* http://jsfiddle.net/JnrvG/1/
* add email confirmation for username or password change
* add image upload
* remember if user has camera/mic and autoset values after second call
* android play() can only be initiated by a user gesture.
* transfer file to another user
* insecure images on usermessage editable div prevent sending messages
* add "Don't show hints anymore" option
* add 404page
* # CONNECTION_MAX_AGE = 3000  # 3600 in my.cnf TODO dooesn't work
* https://code.djangoproject.com/ticket/25489
* http://stackoverflow.com/a/18843553/3872976
* refactor set class name for css instead of settings css
* add multipart smileys
* add canvas images 
* add antispam system
* add http://www.amcharts.com/download/ to chart spam or user statistic info
* add WebWorker http://www.w3schools.com/html/html5_webworkers.asp to load message
* startup loading messages in a separate thread (JS )
* move loading messages on startup to single function? 
* add antiflood settings to nginx
* tornado redis connection reset prevents user from deleting its entry in online_users
* saving all messages in localstorage slows browser repsonsivness 
* run tornado via nginx http://tornado.readthedocs.org/en/latest/guide/running.html
* fixme tornado logs messages to chat.log when messages don't belong to tornadoapp.p
* force users to register
* add media query for register and usersettings to adjust for phone's width
* add change password and realtime javascript to change_profile
* local storage can store another user messasges in case of logout ?
* file upload http://stackoverflow.com/a/14605593/3872976
* add periodic refresh user task -> runs every N hours. publish message to online channel, gets all usernames in N seconds, then edits connection in redis http://michal.karzynski.pl/blog/2014/05/18/setting-up-an-asynchronous-task-queue-for-django-using-celery-redis/
* create tornado class in tornadoapp, put there all tornado logic
* change anonymous message color
*  check if there are new messages after connection lost compare to `localStorage` last message?
 also check id when appedning message to top to prevent double fire issue, append message to bottom if user went offline
* USE init or on_open
* add chat rooms
* allow selecting username in navbar, remove selecting cursor 
