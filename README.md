![python](https://img.shields.io/badge/python-2.7%2C%203.x-blue.svg) ![python](https://img.shields.io/badge/django-1.7-blue.svg) [![Scrutinizer Build pass](https://scrutinizer-ci.com/g/Deathangel908/djangochat/badges/build.png)](https://scrutinizer-ci.com/g/Deathangel908/djangochat) [![Scrutinizer Code Quality](https://scrutinizer-ci.com/g/Deathangel908/djangochat/badges/quality-score.png?b=master)](https://scrutinizer-ci.com/g/Deathangel908/djangochat/?branch=master) [![Code Health](https://landscape.io/github/Deathangel908/djangochat/master/landscape.svg?style=flat)](https://landscape.io/github/Deathangel908/djangochat/master) [![Codacy Badge](https://www.codacy.com/project/badge/b508fef8efba4a5f8b5e8411c0803af5)](https://www.codacy.com/public/nightmarequake/djangochat)

Web chat based on WebSockets.
================================================

Basically written in **Python** with [django](https://www.djangoproject.com/) it uses asynchronous web framework [Tornado](http://www.tornadoweb.org/) for handling realtime messages. Broadcasting messages are being sent by means of [redis](http://redis.io/) [pub/sub](http://en.wikipedia.org/wiki/Publish%E2%80%93subscribe_pattern) feature using Python [tornado-redis](https://github.com/leporo/tornado-redis) backend. It can be run on both **Windows** and **Linux** and tested on **Python 2.7** and **Python 3.x**

To run chat on CentOS 6:
===============
 (See master branch readme for other os support)
 
 0. Run from your pc, Add ssh without authorize`cat .ssh/id_rsa.pub | ssh -p 666 root@ip 'mkdir -p .ssh; cat >> .ssh/authorized_keys'`
 1. add `alias yum="python2 $(which yum)"` to /etc/bashrc if you use python3
 2. Install nginx`yum install nginx`
 3. Install python3 `yum install python34u`
 4. Install python server `yum install uWSGI`
 5. Install python package manager `python34u-pip`. Be careful, yum requires python2.
 6. Install db for session and pubsub `yum install redis`
 7. Install main db `yum install mysql-server, mysql-devel`
 8. Copy config files to rootfs `cp rootfs / -r `
 9. add file `Chat/production.py` , place `SECRET_KEY` there
 10. Create database in mysql `echo "create database django CHARACTER SET utf8 COLLATE utf8_general_ci" | mysql`
 11.  Create redis service. `chkconfig --add redis `. Add it to autostart (optional) `chkconfig redis on`
 12.  Create mysqld service `chkconfig --add mysqld`  Add it to autostart (optional) `chkconfig mysqld on`
 13.  Create uwsgi service `chkconfig --add uwsgi`  Add it to autostart (optional) `chkconfig uwsgi on`
 14.  Create tornado service `chkconfig --add tornado`  Add it to autostart (optional) `chkconfig tornado o`
 15.  Get all dependencies `pip3 install -r requirements.txt`
 16.  Fill database with tables `python manage.py init_db`
 17.  Download static content `sh download_content.sh`

Start the chat:
==============
 1. Start session holder: `service redis-server start`
 3. Run server: `service nginx start`
 4. Start database: `service mysqld start`
 5. Start the Chat: `service uwsgi start`
 2. Start the WebSocket listener: `service tornado start`

=======
#TODO
* remove password field from logs
* refactor set class name for css instead of settings css
* change raw innerHtml to node.appendChild
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
* webrtc -> vlc
* test audio preload on none 
* add media query for register and usersettings to adjust for phone's width
* add lock to loadMessages to prevent doubling getting the same message and appending it twice. 
* add change password and realtime javascript to change_profile
* local storage can store another user messasges in case of logout ?
* file upload http://stackoverflow.com/a/14605593/3872976
* add periodic refresh user task -> runs every N hours. publish message to online channel, gets all usernames in N seconds, then edits connection in redis
* create tornado class in tornadoapp, put there all tornado logic
* change anonymous message color
*  check if there are new messages after connection lost compare to `localStorage` last message?
 also check id when appedning message to top to prevent double fire issue, append message to bottom if user went offline
* USE init or on_open
* show system messages on navbar
* show if user's reconnecting
* deploy on server
* timezone
* add chat rooms
* implement smiles
* check loadmessage top onkeydow
* allow selecting username in navbar, remove selecting cursor 
