![python](https://img.shields.io/badge/python-2.7%2C%203.x-blue.svg) ![python](https://img.shields.io/badge/django-1.7--1.9-blue.svg) [![Scrutinizer Build pass](https://scrutinizer-ci.com/g/Deathangel908/djangochat/badges/build.png)](https://scrutinizer-ci.com/g/Deathangel908/djangochat) [![Scrutinizer Code Quality](https://scrutinizer-ci.com/g/Deathangel908/djangochat/badges/quality-score.png?b=master)](https://scrutinizer-ci.com/g/Deathangel908/djangochat/?branch=master) [![Code Health](https://landscape.io/github/Deathangel908/djangochat/master/landscape.svg?style=flat)](https://landscape.io/github/Deathangel908/djangochat/master) [![Codacy Badge](https://www.codacy.com/project/badge/b508fef8efba4a5f8b5e8411c0803af5)](https://www.codacy.com/public/nightmarequake/djangochat)

Web chat based on WebSockets.
================================================

Basically written in **Python** with [django](https://www.djangoproject.com/) it uses asynchronous web framework [Tornado](http://www.tornadoweb.org/) for handling realtime messages. Broadcasting messages are being sent by means of [redis](http://redis.io/) [pub/sub](http://en.wikipedia.org/wiki/Publish%E2%80%93subscribe_pattern) feature using Python [tornado-redis](https://github.com/leporo/tornado-redis) backend. It can be run on both **Windows** and **Linux** and tested on **Python 2.7** and **Python 3.x**

[Live demo](http://pychat.org/)
================

To run chat on CentOS 6:
===============
 0. Passwordless login to ssh server (optional): run this from client `cat ~/.ssh/id_rsa.pub | ssh -p 666 root@ip 'mkdir -p .ssh; cat >> .ssh/authorized_keys'`
 0. Add `alias yum="python2 $(which yum)"` to /etc/bashrc if you use python3
 0. Install packages `yum install nginx, python34u, uWSGI, python34u-pip, redis, mysql-server, mysql-devel, postfix, mailx, ruby, rubygems`
 0. Install sass `gem install sass`
 0. Copy config files to rootfs `cp rootfs / -r `
 0. Add file `chat/production.py` , place `SECRET_KEY` there
 0. Create database in mysql `echo "create database django CHARACTER SET utf8 COLLATE utf8_general_ci" | mysql`
 0. Create services: `chkconfig --add redis; chkconfig --add mysqld; chkconfig --add uwsgi; chkconfig --add tornado; chkconfig --add postfix`
 0. Optional: add them to autostart: `chkconfig mysqld on; chkconfig uwsgi on; chkconfig tornado on; chkconfig redis on; chkconfig postfix on`
 0. Get all dependencies `pip3 install -r requirements.txt`
 0. Fill database with tables `python manage.py init_db`
 0. Download static content `sh download_content.sh`
 0. Place you certificate in `/etc/nginx/ssl`, you can get free one with startssl. For it start postfix service, send email validation to domain `webmaster@pychat.org` and apply verification code from `/root/Maildir/new/<<time>>`. Generate public key in `/etc/nginx/ssl/server.key` and create certificate with this key on startssl. Download the certificate from startssl and put it into `/etc/nginx/ssl/1_pychat.org_bundle.crt`
 0. Add django admin static files: `python manage.py collectstatic`

 
Start the chat:
==============
 1. Start session holder: `service redis-server start`
 1. Run server: `service nginx start`
 1. Start email server `service postfix start`
 1. Start database: `service mysqld start`
 1. Start the Chat: `service uwsgi start`
 1. Start the WebSocket listener: `service tornado start`
 1. Open in browser http*s*://127.0.0.1

# TODO 
* Disable suggestions in settings (growls)
* Colored print in download_content.sh
* Add multi-language support. 
* Display current keyboard layout in upper right corner as steam
* Move clear cache icon from nav to settings
* max-width for .reg-container doesn't set current width to max (300px) when there's enought free space
* http://jsfiddle.net/JnrvG/1/
* add email confirmation for username or password change
* add image upload
* remember if user has camera/mic and autoset values after second call
* android play() can only be initiated by a user gesture.
* transfer file to another user
* insecure images on usermessage editable div prevent sending messages
* add "Don't show hints anymore" option
* add 404page
* https://code.djangoproject.com/ticket/25489
* http://stackoverflow.com/a/18843553/3872976
* refactor set class name for css instead of settings css
* add multipart smileys
* add canvas images 
* add antispam system
* add http://www.amcharts.com/download/ to chart spam or user s  tatistic info
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
