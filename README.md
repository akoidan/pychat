![python](https://img.shields.io/badge/python-2.7%2C%203.x-blue.svg) ![python](https://img.shields.io/badge/django-1.7--1.9-blue.svg) [![Scrutinizer Build pass](https://scrutinizer-ci.com/g/Deathangel908/djangochat/badges/build.png)](https://scrutinizer-ci.com/g/Deathangel908/djangochat) [![Scrutinizer Code Quality](https://scrutinizer-ci.com/g/Deathangel908/djangochat/badges/quality-score.png?b=master)](https://scrutinizer-ci.com/g/Deathangel908/djangochat/?branch=master) [![Code Health](https://landscape.io/github/Deathangel908/djangochat/master/landscape.svg?style=flat)](https://landscape.io/github/Deathangel908/djangochat/master) [![Codacy Badge](https://www.codacy.com/project/badge/b508fef8efba4a5f8b5e8411c0803af5)](https://www.codacy.com/public/nightmarequake/djangochat)

What is it?
==============
This is free web (browser) chat. It allows users send instant text messages or images, make video/audio calls, send files and other useful stuff.

How it works?
==============
Chat is written in **Python** with [django](https://www.djangoproject.com/). For handling realtime messages [WebSockets](https://en.wikipedia.org/wiki/WebSocket) are used: browser support on client part and asynchronous framework [Tornado](http://www.tornadoweb.org/) on server part. Messages are being broadcast by means of [redis](http://redis.io/) [pub/sub](http://en.wikipedia.org/wiki/Publish%E2%80%93subscribe_pattern) feature using [tornado-redis](https://github.com/leporo/tornado-redis) backend. Redis is also used as django session backend and for storing current users online.  For video call [webrtc](https://webrtc.org/) technology was used with stun server to make a connection, which means you will always get the lowest ping and the best possible connection channel. Client part doesn't use any javascript frameworks (like jquery or datatables) in order to get best performance. Chat written as a singlePage application, so even if user navigates across different pages websocket connection doesn't break. Chat also supports OAuth2 login standard via FaceBook/Google. Css is compiled from [sass](http://sass-lang.com/guide). Server side can be run on any platform **Windows**, **Linux**, **Mac** with **Python 2.7** and **Python 3.x**. Client (users) can use the chat from any browser with websocket support: IE11, Edge, Chrome, Firefox, Android, Opera, Safari...

[Live demo](http://pychat.org/)
================

If you want to serve chat on your server:
==========================================================

Instructions for *[Windows](https://www.microsoft.com/en-us/download/windows.aspx)*:
 1. Install [python](https://www.python.org/downloads/) with pip. Any version **Python2.7** or **Python 3.x** both are supported
 2. Add **pip** and **python** to `PATH` variable.
 3. Install [redis](https://github.com/MSOpenTech/redis/releases). Get the newest version or at least 2.8.
 4. Install [ruby](http://rubyinstaller.org/) and run `gem install sass` from command line as admin. Add **sass** command path to `PATH` variable
 5. Install [mysql](http://dev.mysql.com/downloads/mysql/). You basically need mysql server and python connector. 
 6. You also need to install python's **mysqlclient**. If you want to compile one yourself you need to **vs2015** tools. You can downloads download [visual-studio](https://www.visualstudio.com/en-us/downloads/download-visual-studio-vs.aspx) and install [Common Tools for Visual C++ 2015](http://i.stack.imgur.com/J1aet.png). You need to run setup as administrator. The only connector can be found [here](http://dev.mysql.com/downloads/connector/python/). The wheel (already compiled) connectors can be also found here [Mysqlclient](http://www.lfd.uci.edu/~gohlke/pythonlibs/#mysqlclient). Use `pip` to install them.
 7. Add bash commands to `PATH` variable. **Cygwin** or **git's** will do find.(for example if you use only git **PATH=**`C:\Program Files\Git\usr\bin;C:\Program Files\Git\bin`). 

Instructions for *[Ubuntu](http://www.ubuntu.com/)*:
 1. Install required packages: `apt-get install python pip mysql-server ruby`
 2. Install **redis** database: `add-apt-repository -y ppa:rwky/redis; apt-get install -y redis-server`
 3. Install **sass**: `gem install sass`

Instructions for *[Archlinux](https://www.archlinux.org/)*:
 1. Install required packages: `pacman -S python pip redis mariadb ruby`
 2. Follow the [database guide](https://wiki.archlinux.org/index.php/MySQL) to configure it if you need. 
 5. Install **sass**: `gem install sass`.

Instructions for *[CentOs](https://www.centos.org/)* can be found in [production](https://github.com/Deathangel908/djangochat/tree/production) branch.

You can also find full production setup for *[Archlinux](https://www.archlinux.org/)* in [prod_archlinux](https://github.com/Deathangel908/djangochat/tree/prod_archlinux) branch
  
After you finished installing programs and tools:
 1. Install python packages with `pip install -r requirements.txt`. 
 2. Create database. Open mysql command tool: `mysql -u YOUR_USERNAME -p` and create database `create database django CHARACTER SET utf8 COLLATE utf8_general_ci`. Specify database connection options (username, password) in `chat/settings.py`. Next fill database with tables: `python manage.py init_db`. If you need to add remote access to mysql: `CREATE USER 'root'@'192.168.1.0/255.255.255.0';` `GRANT ALL ON * TO root@'192.168.1.0/255.255.255.0';`
 3. Static content fot chat stores in a [separate repository](https://github.com/Deathangel908/djangochat-config). To download all needed files and compile css execute: `sh download_content.sh`

For developing you can also configure pycharm filewatcher to autocompile css:
 1. arguments: `--no-cache --update $FilePath$:$ProjectFileDir$/chat/static/css/$FileNameWithoutExtension$.css --style expanded`
 2. working directory: `$ProjectFileDir$/chat/static/sass`
 3. output files to refresh: `$ProjectFileDir$/chat/static/css/`
 
Afterwards to start the chat you need:
 0. Start `mysql` server if it's not started. 
 1. Start session holder: `redis-server`
 2. Start webSocket listener: `python manage.py start_tornado`
 3. Start the Chat: `python manage.py runsslserver 0.0.0.0:8000`
 4. Open in browser [http**s**://127.0.0.1:8000](https://127.0.0.1:8000).
 5. If you get an ssl error on establishing websocket connection in browser, that's because you're using self-assigned certificate (provided by [django-sslserver](https://github.com/teddziuba/django-sslserver/blob/master/sslserver/certs/development.crt)).You need to add security exception for websocket `API_PORT` (8888). Open [https://localhost:8888](https://localhost:8888) to do that.

# TODO
* webrtc connection lost while transfering file causes js error
* Add title for room. 
* add scale to painter and Ctrl+Z
* Show online status right of Direct user's messages besides channels' online 
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
* youtube frame
* add pictures preview if user post an url that's content-type =image
* SELECT_SELF_ROOM  https://github.com/Deathangel908/djangochat/blob/master/chat/settings.py#L292-L303 doesnt work with mariadb engine 10.1
* also admin email wasn't triggered while SELECT_SELF_ROOM has failed
