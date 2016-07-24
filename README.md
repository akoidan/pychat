![python](https://img.shields.io/badge/python-2.7%2C%203.x-blue.svg) ![python](https://img.shields.io/badge/django-1.7--1.9-blue.svg) [![Scrutinizer Build pass](https://scrutinizer-ci.com/g/Deathangel908/djangochat/badges/build.png)](https://scrutinizer-ci.com/g/Deathangel908/djangochat) [![Scrutinizer Code Quality](https://scrutinizer-ci.com/g/Deathangel908/djangochat/badges/quality-score.png?b=master)](https://scrutinizer-ci.com/g/Deathangel908/djangochat/?branch=master) [![Code Health](https://landscape.io/github/Deathangel908/djangochat/master/landscape.svg?style=flat)](https://landscape.io/github/Deathangel908/djangochat/master) [![Codacy Badge](https://www.codacy.com/project/badge/b508fef8efba4a5f8b5e8411c0803af5)](https://www.codacy.com/public/nightmarequake/djangochat)
What is it?
==============
This is free web (browser) chat. It allows users send instant text messages or images, make video/audio calls, send files and other useful stuff.

How it works?
==============
Chat is written in **Python** with [django](https://www.djangoproject.com/). For handling realtime messages [WebSockets](https://en.wikipedia.org/wiki/WebSocket) are used: browser support on client part and asynchronous framework [Tornado](http://www.tornadoweb.org/) on server part. Messages are being broadcast by means of [redis](http://redis.io/) [pub/sub](http://en.wikipedia.org/wiki/Publish%E2%80%93subscribe_pattern) feature using [tornado-redis](https://github.com/leporo/tornado-redis) backend. Redis is also used as django session backend and for storing current users online.  For video call [webrtc](https://webrtc.org/) technology was used with stun server to make a connection, which means you will always get the lowest ping and the best possible connection channel. Client part doesn't use any javascript frameworks (like jquery or datatables) in order to get best performance. Chat written as a singlePage application, so even if user navigates across different pages websocket connection doesn't break. Css is compiled from [sass](http://sass-lang.com/guide). Server side can be run on any platform **Windows**, **Linux**, **Mac** with **Python 2.7** and **Python 3.x**. Client (users) can use the chat from any browser with websocket support: IE11, Edge, Chrome, Firefox, Android, Opera, Safari...

[Live demo](http://pychat.org/)
================

Get started:
================
In order to run chat on you server you will need:
 1. *Python2.7* or *Python 3.x* both are supported
 2. *pip* for getting dependencies
 3. *redis* for holding session and pubsub messages
 4. *sass* to compiling css
 5 *mysql* database
 6. Get python packages
 7. Create the database
 8. Copy static content (audio, fonts...)

Windows:
 1. Install [python](https://www.python.org/downloads/) with pip 
 2. Add pip and python to PATH variable
 3. Install [redis](https://github.com/rgl/redis/downloads)
 4. Install [ruby](http://rubyinstaller.org/) and run `gem install sass` from command line as admin. Add sass command path to PATH variable
 5. Install [mysql](http://dev.mysql.com/downloads/mysql/). You basically need mysql server and python connector. The only connector can be found [here](http://dev.mysql.com/downloads/connector/python/). The wheel connectors can be also found here [Mysqlclient](http://www.lfd.uci.edu/~gohlke/pythonlibs/#mysqlclient). Use pip to install them
 6. To compile pip3 `mysqlclient` u need `vs2015` tools, download [visual-studio](https://www.visualstudio.com/en-us/downloads/download-visual-studio-vs.aspx) and install [Common Tools for Visual C++ 2015](http://i.stack.imgur.com/J1aet.png). You need to run setup as administrator.
 7. Add git's bash commands (for example "C:\Program Files\Git\usr\bin;C:\Program Files\Git\bin") to PATH variable

Ubuntu:
 1. `apt-get install python`
 2. `apt-get install pip`
 3. `add-apt-repository -y ppa:rwky/redis` `apt-get install -y redis-server`
 4  `apt-get install mysql-server`
 5. `apt-get install ruby`, `gem install sass`

Archlinux:
 1. `pacman -S python`
 2. `pacman -S pip`
 3. `pacman -S community/redis`
 4. `pacman -S  mariadb`. Check [wiki](https://wiki.archlinux.org/index.php/MySQL) for more info 
 5. `pacman -S ruby`, `gem install sass`

Next steps are common:
 1. `pip install -r requirements.txt`
 2. open `mysql -u YOUR_USERNAME -p` and create database `create database django CHARACTER SET utf8 COLLATE utf8_general_ci`. Specify database connection options (username, password) in `chat/settings.py`. Next fill database with tables: `python manage.py init_db`
 3. `sh download_content.sh`

For developing option you can also configure pycharm filewatcher to autocompile css:
 1. arguments: `--no-cache --update $FilePath$:$ProjectFileDir$/chat/static/css/$FileNameWithoutExtension$.css --style expanded`
 2. working directory: `$ProjectFileDir$/chat/static/sass`
 3. output files to refresh: `$ProjectFileDir$/chat/static/css/`
 
Start the chat:
===============
 0. Start `mysql` server if it's not started. 
 1. Start session holder: `redis-server`
 2. Start WebSocket listener: `python manage.py start_tornado`
 3. Start the Chat: `python manage.py runsslserver 0.0.0.0:8000`
 4. Open in browser [http*s*://127.0.0.1:8000](https://127.0.0.1:8000)
 5. If you're using firefox you probably need to allow self-assigned certificate for development. Open [https://localhost:8888](https://localhost:8888) (8888 is `API_PORT`) and add security exception

# TODO
* add scale to painter and Ctrl+Z
* Add delete/edit message option (skype alike)
* View profile show wrong profile
* Show online status right of Direct user's messages besides channels' online
* password reset send once, confirmation email on email change, 
* User can't create direct group for himself if he already created groups for others  
* TODO if someone offers a new call till establishing connection for a call self.call_receiver_channel would be set to wrong
* !!!IMPORTANT Debug call dialog by switching channels while calling and no.
* shape-inside for contentteditable 
* Colored print in download_content.sh
* Add multi-language support. 
* Move clear cache icon from nav to settings
* add email confirmation for username or password change
* remember if user has camera/mic and autoset values after second call
* android play() can only be initiated by a user gesture.
* insecure images on usermessage editable div prevent sending messages
* add 404page
* # CONNECTION_MAX_AGE = 3000  # 3600 in my.cnf TODO dooesn't work
* https://code.djangoproject.com/ticket/25489
* http://stackoverflow.com/a/18843553/3872976
* add antispam system
* add http://www.amcharts.com/download/ to chart spam or user s  tatistic info
* startup loading messages in a separate thread (JS )
* move loading messages on startup to single function? 
* add antiflood settings to nginx
* tornado redis connection reset prevents user from deleting its entry in online_users
* run tornado via nginx http://tornado.readthedocs.org/en/latest/guide/running.html
* fixme tornado logs messages to chat.log when messages don't belong to tornadoapp.p
* add media query for register and usersettings to adjust for phone's width
* add change password and realtime javascript to change_profile
* file upload http://stackoverflow.com/a/14605593/3872976
* add periodic refresh user task -> runs every N hours. publish message to online channel, gets all usernames in N seconds, then edits connection in redis http://michal.karzynski.pl/blog/2014/05/18/setting-up-an-asynchronous-task-queue-for-django-using-celery-redis/ 