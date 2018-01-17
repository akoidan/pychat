![python](https://img.shields.io/badge/python-2.7%2C%203.x-blue.svg) ![python](https://img.shields.io/badge/django-1.7--1.9-blue.svg) [![Scrutinizer Build pass](https://scrutinizer-ci.com/g/Deathangel908/djangochat/badges/build.png)](https://scrutinizer-ci.com/g/Deathangel908/djangochat) [![Scrutinizer Code Quality](https://scrutinizer-ci.com/g/Deathangel908/djangochat/badges/quality-score.png?b=master)](https://scrutinizer-ci.com/g/Deathangel908/djangochat/?branch=master) [![Code Health](https://landscape.io/github/Deathangel908/djangochat/master/landscape.svg?style=flat)](https://landscape.io/github/Deathangel908/djangochat/master) [![Codacy Badge](https://www.codacy.com/project/badge/b508fef8efba4a5f8b5e8411c0803af5)](https://www.codacy.com/public/nightmarequake/djangochat)

This is free web (browser) chat, that features:
 - Send instant text messages via websockets.
 - Send: images, smiles, anchors, embedded youtube, [giphy](https://giphy.com/), code [highlight](https://highlightjs.org/)
 - Make calls and video conference using [Peer to peer](https://en.wikipedia.org/wiki/Peer-to-peer) WebRTC.
 - Share screen during call or conference
 - Send files directly to another PC (p2p) using WebRTC + FileSystem Api (Average speed is 25MByte/s, limited by RTCDataChannel speed, but already is twice more than 100Mbit wan)
 - Edit images with integrated painter (brush/line/reactangle/oval/flood fill/erase/crop/cpilboard paste/resize/rotate/zoom/add text/ctrl+a)
 - Login in with facebook/google oauth.
 - Send offline messages with Firebase push notifications
 - Responsive interface (bs like)+ themes

Live demo: [pychat.org](http://pychat.org/)

# Table of contents
  * [Breaf description](#breaf-description)
  * [How to run on my own server](#how-to-run-on-my-own-server)
    * [Via Docker](#vid-docker)
    * [Manual Setup](#manual-setup)
       * [Install OS packages](#install-os-packages)
         * [Windows](#windows)
         * [Ubuntu](#ubuntu)
         * [Archlinux](#archlinux)
         * [CentOs](#centos)
         * [Production](#production)
       * [Bootstrap files](#bootstrap-files)
       * [Start services](#start-services)
    * [Check it out](#check-it-out)
  * [Contributing](#contributing)
  * [TODO list](#todo-list)

# Breaf description

Chat is written in **Python** with [django](https://www.djangoproject.com/). For handling realtime messages [WebSockets](https://en.wikipedia.org/wiki/WebSocket) are used: browser support on client part and asynchronous framework [Tornado](http://www.tornadoweb.org/) on server part. Messages are being broadcast by means of [redis](http://redis.io/) [pub/sub](http://en.wikipedia.org/wiki/Publish%E2%80%93subscribe_pattern) feature using [tornado-redis](https://github.com/leporo/tornado-redis) backend. Redis is also used as django session backend and for storing current users online.  For video call [WebRTC](https://webrtc.org/) technology was used with stun server to make a connection, which means you will always get the lowest ping and the best possible connection channel. Client part doesn't use any javascript frameworks (like jquery or datatables) in order to get best performance. Chat written as a singlePage application, so even if user navigates across different pages websocket connection doesn't break. Chat also supports OAuth2 login standard via FaceBook/Google. Css is compiled from [sass](http://sass-lang.com/guide). Server side can be run on any platform **Windows**, **Linux**, **Mac** with **Python 2.7** and **Python 3.x**.Client (users) can use the chat from any browser with websocket support: IE11, Edge, Chrome, Firefox, Android, Opera, Safari...

# How to run on my own server:

## Via docker

This is the fastest way to try out pychat. Just run `docker-compose -f docker/docker-compose.yml up` and open `https://localhost:8000/#/chat/1`

## Manual setup

If docker method lacks something or you just simply need the development configuration you can always set everything up yourself.

### Install OS packages

This section depends on the OS you use. I tested full install on Windows/Ubuntu/CentOs/Archlinux/Archlinux(rpi2 armv7). [pychat.org](https://pychat.org) currently runs on Archlinux rpi2.

#### [Windows](https://www.microsoft.com/en-us/download/windows.aspx):
 1. Install [python](https://www.python.org/downloads/) with pip. Any version **Python2.7** or **Python 3.x** both are supported
 2. Add **pip** and **python** to `PATH` variable.
 3. Install [redis](https://github.com/MSOpenTech/redis/releases). Get the newest version or at least 2.8.
 4. Install [sassc](http://sass-lang.com/libsass). Add **sassc** command path to `PATH` variable.
 5. Install [mysql](http://dev.mysql.com/downloads/mysql/). You basically need mysql server and python connector. 
 6. You also need to install python's **mysqlclient**. If you want to compile one yourself you need to **vs2015** tools. You can download [visual-studio](https://www.visualstudio.com/en-us/downloads/download-visual-studio-vs.aspx) and install [Common Tools for Visual C++ 2015](http://i.stack.imgur.com/J1aet.png). You need to run setup as administrator. The only connector can be found [here](http://dev.mysql.com/downloads/connector/python/). The wheel (already compiled) connectors can be also found here [Mysqlclient](http://www.lfd.uci.edu/~gohlke/pythonlibs/#mysqlclient). Use `pip` to install them.
 7. Add bash commands to `PATH` variable. **Cygwin** or **git's** will do find.(for example if you use only git **PATH=**`C:\Program Files\Git\usr\bin;C:\Program Files\Git\bin`).

#### [Ubuntu](http://www.ubuntu.com/):
 1. Install required packages: `apt-get install python pip mysql-server ruby`
 2. Install **redis** database: `add-apt-repository -y ppa:rwky/redis; apt-get install -y redis-server`
 3. Install **sassc**. You can find instructions [here](http://crocodillon.com/blog/how-to-install-sassc-and-libsass-on-ubuntu). Or maybe you can find packet in ubuntu repository. Alternatively you can use any other sass. 

#### [Archlinux](https://www.archlinux.org/):
 1. Install required packages: `pacman -S python pip redis mariadb ruby sassc`
 2. Follow the [database guide](https://wiki.archlinux.org/index.php/MySQL) to configure it if you need. 

### [CentOs](https://www.centos.org/)
There's stale branch [production](https://github.com/Deathangel908/djangochat/tree/production) that was used for centos. Basic instruction you can find there.

#### Production
You can also find full production setup for *[Archlinux](https://www.archlinux.org/)* in [prod_archlinux](https://github.com/Deathangel908/djangochat/tree/prod_archlinux) branch
  
### Bootstrap files:
 1. Install python packages with `pip install -r requirements.txt`. 
 2. Create database. Open mysql command tool: `mysql -u YOUR_USERNAME -p` and create database `create database pychat CHARACTER SET utf8 COLLATE utf8_general_ci`. Specify database connection options (username, password) in `chat/settings.py`. Next fill database with tables: `python manage.py init_db`. If you need to add remote access to mysql: `CREATE USER 'root'@'192.168.1.0/255.255.255.0';` `GRANT ALL ON * TO root@'192.168.1.0/255.255.255.0';`
 3. Populate project files: `sh download_content.sh all`
 4. If you want to use [Giphy](https://giphy.com/), you need to sign up in [developers.giphy.com](https://developers.giphy.com/) , create a new app there, and add `GIPHY_API_KEY` to [settings.py](chat/settings.py)
 5. Pychat also supports [webpush](https://developers.google.com/web/fundamentals/push-notifications/) notifications, like in facebook. They will fire even user doesn't have opened tab. That can be turned on/off by used in his/her profile with checkbox `Notifications`. The implementation is similar like [here](https://github.com/GoogleChrome/samples/tree/gh-pages/push-messaging-and-notifications). So to add notification support you need
    1. Create a project on the [Firebase Developer Console](https://console.firebase.google.com/):
    2. Go to Settings (the cog near the top left corner), click the [Cloud Messaging Tab](https://console.firebase.google.com/u/1/project/pychat-org/settings/cloudmessaging/)
    3. Put `<Your Cloud Messaging API Key ...>` to [settings.py](chat/settings.py) as `FIREBASE_API_KEY`
    4. Create `chat/static/manifest.json` with content like [here](https://github.com/GoogleChrome/samples/blob/gh-pages/push-messaging-and-notifications/manifest.sample.json):
  ```
{
  "name": "Pychat Push Notifications",
  "short_name": "PyPush",
  "start_url": "/",
  "display": "standalone",
  "gcm_sender_id": "<Your Sender ID from https://console.firebase.google.com>"
}
```
 
### Start services:
 0. Start `mysql` server if it's not started. 
 1. Start session holder: `redis-server`
 2. Start webSocket listener: `python manage.py start_tornado`
 3. Start the Chat: `python manage.py runsslserver 0.0.0.0:8000`

## Check if everything works:
 - Open in browser [http**s**://127.0.0.1:8000](https://127.0.0.1:8000).
 - If you get an ssl error on establishing websocket connection in browser (at least in Firefox, chrome should be fine), that's because you're using self-assigned certificate (provided by [django-sslserver](https://github.com/teddziuba/django-sslserver/blob/master/sslserver/certs/development.crt)).You need to add security exception for websocket `API_PORT` (8888). Open [https://localhost:8888](https://localhost:8888) to do that.

 
# Contributing:
Take a look at [Contributing.md](/CONTRIBUTING.md) for more info details.
 
# TODO list
* giphy search should return random image
* FIrebase message should update notification instead of showing one, even push notificaiton should update and not dissapear
* WS close event doesn't fire after suspending PC to ram https://github.com/websockets/ws/issues/686
* Add payback to firebase
* Add docker
* Fix all broken painter event in mobile
* youtube iframe should contain full link with time and other parmas
* https://static.pychat.org/photo/xE9bSyvC_image.png
* https://developers.google.com/web/updates/2015/12/background-sync
* Added bad code stub for: Wrong message order, that prevents of successful webrtc connection: https://github.com/leporo/tornado-redis/issues/106 https://stackoverflow.com/questions/47496922/tornado-redis-garantee-order-of-published-messages
* No sound in call https://bugs.chromium.org/p/chromium/issues/detail?id=604523
* paste event doesn't fire at all most of the times on painter canvasHolder, mb try to move it to <canvas>
* Replaced email oauth with fb\google id and add them to profile
* Add applying zoom to method that trigger via keyboard in canvas
* add queued messaged to wsHandler, if ws is offline messages goes to array. userMessage input clears after we press enter and we don't restore its state we just put message to queue. When webrtc is disconnected we send reconnect event to this ws.queue
* Just a note https://codepen.io/techslides/pen/zowLd , i guess transform: scale is better https://stackoverflow.com/questions/11332608/understanding-html-5-canvas-scale-and-translate-order https://stackoverflow.com/questions/16687023/bug-with-transform-scale-and-overflow-hidden-in-chrome
* remove setHeaderTest, highlight current page icos. Always display username in right top
* add timeout to call. (finish after timeout) Display busy if calling to SAME chanel otherwise it will show multiple videos
* file transfer - add ability to click on user on receivehandler popup (draggable)
* add message queue if socketed is currently disconnected ???
* Add link to gihub in console
* Add title for room.
* TODO if someone offers a new call till establishing connection for a call self.call_receiver_channel would be set to wrong
* !!!IMPORTANT Debug call dialog by switching channels while calling and no.
* shape-inside for contentteditable 
* Add multi-language support. 
* add email confirmation for username or password change
* remember if user has camera/mic and autoset values after second call
* android play() can only be initiated by a user gesture.
* add 404page
* https://code.djangoproject.com/ticket/25489
* http://stackoverflow.com/a/18843553/3872976
* add antispam system
* add http://www.amcharts.com/download/ to chart spam or user s  tatistic info
* startup loading messages in a separate thread (JS )
* move loading messages on startup to single function? 
* add antiflood settings to nginx
* tornado redis connection reset prevents user from deleting its entry in online_users
* fixme tornado logs messages to chat.log when messages don't belong to tornadoapp.p
* add media query for register and usersettings to adjust for phone's width
* add change password and realtime javascript to change_profile
* file upload http://stackoverflow.com/a/14605593/3872976
* add periodic refresh user task -> runs every N hours. publish message to online channel, gets all usernames in N seconds, then edits connection in redis http://michal.karzynski.pl/blog/2014/05/18/setting-up-an-asynchronous-task-queue-for-django-using-celery-redis/ 
* youtube frame
* add pictures preview if user post an url that's content-type =image
* SELECT_SELF_ROOM  https://github.com/Deathangel908/djangochat/blob/master/chat/settings.py#L292-L303 doesnt work with mariadb engine 10.1
* also admin email wasn't triggered while SELECT_SELF_ROOM has failed
