<p align="center"><img src="./logo/logo.svg"></p>

[![Scrutinizer Build pass](https://scrutinizer-ci.com/g/Deathangel908/pychat/badges/build.png)](https://scrutinizer-ci.com/g/Deathangel908/pychat) [![Scrutinizer Code Quality](https://scrutinizer-ci.com/g/Deathangel908/pychat/badges/quality-score.png?b=master)](https://scrutinizer-ci.com/g/Deathangel908/pychat/?branch=master) [![Code Health](https://landscape.io/github/Deathangel908/pychat/master/landscape.svg?style=flat)](https://landscape.io/github/Deathangel908/pychat/master) [![Codacy Badge](https://api.codacy.com/project/badge/Grade/b508fef8efba4a5f8b5e8411c0803af5)](https://www.codacy.com/app/nightmarequake/pychat?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=Deathangel908/pychat&amp;utm_campaign=Badge_Grade)

This is free web (browser) chat, that features:
 - Send instant text messages via websockets.
 - Send: images, smiles, anchors, embedded youtube, [giphy](https://giphy.com/), code [highlight](https://highlightjs.org/)
 - Make calls and video conference using [Peer to peer](https://en.wikipedia.org/wiki/Peer-to-peer) WebRTC.
 - Share screen during call or conference
 - Send files directly to another PC (p2p) using WebRTC + FileSystem Api (up to 50MByte/s, limited by RTCDataChannel speed)
 - Edit images with integrated painter (brush/line/reactangle/oval/flood fill/erase/crop/cpilboard paste/resize/rotate/zoom/add text/ctrl+a)
 - Login in with facebook/google oauth.
 - Send offline messages with Firebase push notifications
 - Responsive interface (bs like)+ themes
 - Admin interface with django-admin

## Live demo: [pychat.org](https://pychat.org/)

# Table of contents
  * [Breaf description](#brief-description)
  * [When should I use pychat](#when-should-i-use-pychat)
  * [How to run on my own server](#how-to-run-on-my-own-server)
    * [Run test docker image](#run-test-docker-image)
    * [Build docker](#build-docker)
    * [Development setup](#development-setup)
       * [Install OS packages](#install-os-packages)
         * [Windows](#windows)
         * [Ubuntu](#ubuntu)
         * [Archlinux](#archlinux)
         * [CentOs](#centos)
       * [Bootstrap files](#bootstrap-files)
       * [Configure Pycharm if you use it](#configure-pycharm-if-you-use-it)
       * [Start services and run](#start-services-and-run)
    * [Production setup](#production-setup)
       * [Archlinux prod](#archlinux-prod)
       * [CentOs prod](#centos-prod)
  * [Contributing](#contributing)
  * [TODO list](#todo-list)

# Brief description
Pychat is written in **Python** with [django](https://www.djangoproject.com/). For handling realtime messages [WebSockets](https://en.wikipedia.org/wiki/WebSocket) are used: browser support on client part and asynchronous framework [Tornado](http://www.tornadoweb.org/) on server part. Messages are being broadcast by means of [redis](http://redis.io/) [pub/sub](http://en.wikipedia.org/wiki/Publish%E2%80%93subscribe_pattern) feature using [tornado-redis](https://github.com/leporo/tornado-redis) backend. Redis is also used as django session backend and for storing current users online.  For video call [WebRTC](https://webrtc.org/) technology was used with stun server to make a connection, which means you will always get the lowest ping and the best possible connection channel. Client part is written with progressive js framework [VueJs](https://vuejs.org/) which means that pychat is SPA, so even if user navigates across different pages websocket connection doesn't break. Pychat also supports OAuth2 login standard via FaceBook/Google. Css is compiled from [sass](http://sass-lang.com/guide). Server side can be run on any platform **Windows**, **Linux**, **Mac** with **Python 2.7** and **Python 3.x**.Client (users) can use the Pychat from any browser with websocket support: IE11, Edge, Chrome, Firefox, Android, Opera, Safari...

# When should I use pychat:
By this time there're a lot of chats: skype, telegram, discord, slack, viber... What is the purpose of one more? Well, here's why:
 - You need a private chat for your company. Maybe you want to share it over private network, so only some people can access it.
 - You don't want your entire chat to be managable by 3rd party SaaS. 3rd party services can compromise your data or just disappear one day. You may also google for history leaks. Only with pychat you gain full controll over your chat.
 - You don't want to spend a penny on chat. While most of service come free in standard edition, they are still making money from you somehow. And when you've been using them a while, once you will discover that the feature that you need is paid. Forget about it all! Every single feature is free in pychat!
 - You need a custom feature in your chat that no other solutions provide. Codding chat from the scratch is really long-way-ticket (oh believe me). Just fork pychat and code anything you want there.
 - You just want the running chat and you don't have time on this nonsence. Follow the [Build docker](#build-docker) section. It's takes only a few minutes to setup an instance.

# How to run on my own server:
You can always use [pychat.org](https://pychat.org), but if you want run Pychat yourself you have 3 options:
 - Test pychat with prebuilt docker image
 - Build docker image for production/test
 - Run Pychat for development
 - Set up for production w/o docker

## Run test docker image
 - Download and run image: `docker run -p 443:443 deathangel908/pychat:test`
 - Open https://localhost
Please don't use this build for production, as it uses debug ssl certificate, lacks a few features and all files are located inside of container, meaning you will lose all data on container destroy.

## Build docker
 - Clone this project 'git clone https://github.com/Deathangel908/pychat; cd ./pychat'
 - Generate ssl certificates:
   - If you have bash installed: `./download_content.sh generate_certificate`
   - You can also generate them manually and put into `./rootfs/etc/nginx/ssl/server.key` and `./rootfs/etc/nginx/ssl/certificate.crt`
 - Rename [chat/settings_example.py](chat/settings_example.py) to `chat/settings.py`. Execute `bash download_content.sh generate_secret_key`. If you need additional features like oauth/push notifications you can set those up by editing `chat/settings.py` and `fe/production.json`
- Run my built image: `docker-compose -f ./docker-all/docker-compose.yml up`.
 - Open https://localhost . If something is broken you can check /srv/http/log/ in docker `docker exec -it containerId bash`

## Development setup
The flow is the following
 - Install OS packages depending on your OS type
 - Bootstrap files
 - Follow instructions in `fe/README.md`
 - Start services and check if it works

### Install OS packages
This section depends on the OS you use. I tested full install on Windows/Ubuntu/CentOs/Archlinux/Archlinux(rpi2 armv7). [pychat.org](https://pychat.org) currently runs on Archlinux rpi2.

#### [Windows](https://www.microsoft.com/en-us/download/windows.aspx):
 1. Install [python](https://www.python.org/downloads/) with pip. Any version **Python2.7** or **Python 3.x** both are supported.
 2. Add **pip** and **python** to `PATH` variable.
 3. Install [redis](https://github.com/MSOpenTech/redis/releases). Get the newest version or at least 2.8.
 4. Install [sassc](http://sass-lang.com/libsass). Add **sassc** command path to `PATH` variable.
 5. Install [mysql](http://dev.mysql.com/downloads/mysql/). You basically need mysql server and python connector.
 6. You also need to install python's **mysqlclient**. If you want to compile one yourself you need to **vs2015** tools. You can download [visual-studio](https://www.visualstudio.com/en-us/downloads/download-visual-studio-vs.aspx) and install [Common Tools for Visual C++ 2015](http://i.stack.imgur.com/J1aet.png). You need to run setup as administrator. The only connector can be found [here](http://dev.mysql.com/downloads/connector/python/). The wheel (already compiled) connectors can be also found here [Mysqlclient](http://www.lfd.uci.edu/~gohlke/pythonlibs/#mysqlclient). Use `pip` to install them.
 7. Add bash commands to `PATH` variable. **Cygwin** or **git's** will do find.(for example if you use only git **PATH=**`C:\Program Files\Git\usr\bin;C:\Program Files\Git\bin`). Also add there new environment variable `PYCHAT_CONFIG=local`

#### [Ubuntu](http://www.ubuntu.com/):
 1. Install required packages: `apt-get install python pip mysql-server` If pip is missing check `python-pip`.
 2. Install **redis** database: `add-apt-repository -y ppa:rwky/redis; apt-get install -y redis-server`
 3. Install **sassc**. You can find instructions [here](http://crocodillon.com/blog/how-to-install-sassc-and-libsass-on-ubuntu). Or maybe you can find packet in ubuntu repository. Alternatively you can use any other sass.
 4. `echo 'export PYCHAT_CONFIG=local' >> /etc/profile`

#### [Archlinux](https://www.archlinux.org/):
 1. With py3:  `pacman -S unzip python python-pip redis mariadb  sassc`. `yaourt -S aur/python-mysqlclient`. For py2 use `extra/mysql-python`
 2. If you just installed mariadb you need to initialize it: `mysql_install_db --user=mysql --basedir=/usr --datadir=/var/lib/mysql`.
 3. `echo 'export PYCHAT_CONFIG=local' >> /etc/profile`

### Bootstrap files:
 1. I use 2 git repos in 2 project directory. So you probably need to rename `excludeMAIN`file to `.gitignore`or create link to exclude. `ln -rsf .excludeMAIN .git/info/exclude`
 2. Rename [chat/settings_example.py](chat/settings_example.py) to `chat/settings.py`. Modify file according to the comments in it.
 3. Install VirtualEnv if you don't have it. `pip install virtualenv`. 
 4. Create virtualEnv `virtualenv --system-site-packages .venv` and activate it: source `.venv/bin/activate`
 5. Install python packages with `pip install -r requirements.txt`.
 6. Create database: `echo "create database pychat CHARACTER SET utf8 COLLATE utf8_general_ci" | mysql`.If you need to add remote access to mysql: `CREATE USER 'root'@'192.168.1.0/255.255.255.0';` `GRANT ALL ON * TO root@'192.168.1.0/255.255.255.0';`
 7. Fill database with tables: `./manage.py init_db && ./manage.py sync_db`
 8. Populate project files: `sh download_content.sh all`

### Configure Pycharm if you use it:
 1. Enable django support. Go to Settings -> Django -> Enable django support. 
   - Django project root: root directory of your project. Where .git asides.
   - Put `Settings:` to `chat/settings.py`
   - 'Environment variables: `PYCHAT_CONFIG=local`
 2. `Settings` -> `Project pychat` -> `Project Interpreter` -> `Cogs in right top` -> 'Add' -> `Virtual Environment` -> `Existing environment` -> `Interpereter` = `pychatdir/.venv/bin/python`. Click ok. In previous menu on top 'Project interpreter` select the interpriter you just added.
 3. `Settings` -> `Project: pychat` -> `Project structure`
  - You might want to exclude: `.idea`, `chat/static/css`
  - mark `templates` directory as `Template Folder`
 4. Add start scripts:
 - Add server script: `Run` -> `Edit configuration` ->  `Django server` -> Checkbox `Custom run command` `runsslserver` . Leave port 8000 as it it. Click on Environment Variable and set `PYCHAT_CONFIG=local`
 - Add tornado script: `Run` -> `Edit configuration` ->  `Django server` -> Checkbox `Custom run command` `start_tornado`. Remove port value. Click on Environment Variable and set `PYCHAT_CONFIG=local`


### Start services and run:
 - Start `mysql` server if it's not started.
 - Start session holder: `redis-server`
 - Start webSocket listener: `python manage.py start_tornado`
 - Start the Chat: `python manage.py runsslserver 0.0.0.0:8000`
 - Open in browser [http**s**://127.0.0.1:8080](https://127.0.0.1:8080).
 - Add self signed ssl certificate provided by [django-sslserver](https://github.com/teddziuba/django-sslserver/blob/master/sslserver/certs/development.crt) to browser exception. Open [https://localhost:8888](https://localhost:8888) and [https://localhost:8000](https://localhost:8000). Where `8888` is `API_PORT` and `8000` is `manage.py` argument.

## Production setup
Further instructions assume that you're executing them from project directory. First of of you need to install packages for Archlinux/CentOS and then follow the [Common](#common) flow

### Archlinux prod
Services commands for Archlinux:
 - Start services:  `packages=( mysqld  redis uwsgi tornado nginx postfix ) ; for package in "${packages[@]}" ; do systemctl enable $package; done;`
 - Enabling autostart: `packages=( redis  nginx postfix mysqld uwsgi tornado) ; for package in "${packages[@]}" ; do systemctl start $package; done;`

Installing packages for Archlinux:
 - Install packages `pacman -S nginx postfix gcc jansson`.
 - Install `pip install uwsgi`. You also can install `uwsgi` and `uwsgi-plugin-python` via pacman but I found pip's package more stable.
 - Follow the instructions in [Archlinux](#archlinux).

### CentOS prod
Installing packages for Archlinux
 - Add `alias yum="python2 $(which yum)"` to /etc/bashrc if you use python3
 - Install packages `yum install nginx, python34u, uWSGI, python34u-pip, redis, mysql-server, mysql-devel, postfix, mailx`

Services commands for Archlinux:
 - Start services: `packages=( redis-server  nginx postfix mysqld uwsgi tornado) ; for package in "${packages[@]}" ; do service $package start; done;`
 - Enabling autostart: `chkconfig mysqld on; chkconfig uwsgi on; chkconfig tornado on; chkconfig redis on; chkconfig postfix on`

### Common
 - Set environment variable `PYCHAT_CONFIG=prod`
 - Follow the instructions in [Boostrap files](#bootstrap-files).
 - For production I would recommend to clone repository to `/srv/http/pychat`.  If you cloned project into different directory than `/srv/http/pychat` replace all absolute paths in config files. You can use `download_content.sh rename_root_directory` to do that.
 - Replace all occurrences of `pychat.org` in [rootfs](rootfs) for your domain. You can use `./download_content.sh rename_domain your.new.domain.com`
 - Also check `rootfs/etc/nginx/nginx.conf` you may want to merge `location /photo` and `location /static` into main `server` conf. You need all of this because I used subdomain for static urls/
 - HTTPS is required for webrtc calls so you need to enable ssl:
   - Obtain ceritifcate.
       - Register online. There're a lot of free and paid services. Like comodo or startssl(only 1 year free). Here's instructions for startssl.
         - Follow the instructions in https://www.startssl.com.
         - Start postfix service (it's required to verify that you have access to domain)
         - Send validation email to domain `webmaster@pychat.org`
         - Apply verification code from `/root/Maildir/new/<<time>>` (you may also need to  disable ssl in /etc/postfix/main.cf since it's enabled by default).
         - You can generate server.key and get certificate from  https://www.startssl.com/Certificates/ApplySSLCert .
       - Generate custom certificate.
         - execute `./download_content.sh generate_certificate`
         - Or generate by yourself
   - Now you got certificate and you want to put files according to [nginx.conf](rootfs/etc/nginx/nginx.conf). Copy server key into `./rootfs/etc/nginx/ssl/server.key` and certificate into `./rootfs/etc/nginx/ssl/certificate.crt`.
   - Don't forget to change owner of files to http user `chown -R http:http /etc/nginx/ssl/`
 - Copy config files to rootfs `cp rootfs / -r `. Change owner of project to `http` user: `chown -R http:http`. And reload systemd config `systemctl daemon-reload`.
 - Generate postfix postman: `postmap /etc/postfix/virtual; postman /etc/aliases`
 - Add django admin static files: `python manage.py collectstatic`
 - Execute start services and if you need enablign autostart commands described for [Archlinux](#archliunux-prod) or [CentOS](#centos-prod)
 - Open in browser [http**s**://your.domain.com](https://127.0.0.1). Note that by default nginx accepts request by domain.name rather than ip.
 - If something doesn't work you want to check `pychat/logs` directory. If there's no logs in directory you may want to check service stdout: `sudo journalctl -u YOUR_SERVICE`. Check that user `http` has access to you project directory.

# Contributing:
Take a look at [Contributing.md](/CONTRIBUTING.md) for more info details.
 
# TODO list
* auto generate docker image on commit
* If new user register on sites and join to public room, he  adds online but he aint present in room `all` therefore he aint present in user list at all.
* If self assigned certificate was used, mb add user an option to click on iframe or smth?
* Giphy: The gif-picture won't change after editing and leaving it's name. But there are tons of other gifs under every tag. 
* If user A was online in Brower BA and he didn't have any history, when he joins online from browser B and send the message, it won't appear on browser BA when he opens ba.
* RoomUsers should have disabled instead of Room, so when user leaves direct messages, another one doesn't exit it. But in case of new message, user just doesn't receive any... Mb we can make them hidden in UI
* Merge base.js into chat.js so 1 request less
* https://github.com/tornadoweb/tornado/issues/2243
* Add sound/video messages like in telegram
* Add webrtc peer to peer secure chats (like telegrams)
* output logs to kibana
* openrc is not getting killed in docker https://github.com/dockage/alpine-openrc/issues/2
* Store userOnline in a single list, refactor All channel for online storing
* Add "last seen" feature and status afk/online/dnd
* blink icon in title on new message
* Add message to favorite
* Ability to quote any code
* Paint errors
* Add ability to show growls messages to channel from ADMIN
* gitb don't backup files larger than 10MB
* Add "last seen" feature
* Add video/voice record to chat like in telegram
* https://static.pychat.org/photo/uEXCJWJH_image.png
* Add go down button if scroll is not in the botom for chatbox
* Firefox doesn't google support fcm push
* Transfer file should be inside of chatbox instead of being a separate window
* Messages should appear in chat instantly with automatic resend when connection is up
* signup verification emails is sent to admin instead of current user.
* Add avatar to notifications and users 
* update service worker if its version changed with registration.update()
* setTimeot stops working after 30min in chrome background, it has been changed to setInterval, check if it works
* giphy search should return random image
* Add payback to firebase
* Fix all broken painter event in mobile
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
* remember if user has camera/mic and autoset values after second call
* android play() can only be initiated by a user gesture.
* add 404page
* https://code.djangoproject.com/ticket/25489
* http://stackoverflow.com/a/18843553/3872976
* add antispam system
* move loading messages on startup to single function? 
* add antiflood settings to nginx
* tornado redis connection reset prevents user from deleting its entry in online_users
* add media query for register and usersettings to adjust for phone's width
* file upload http://stackoverflow.com/a/14605593/3872976
* add pictures preview if user post an url that's content-type =image
* SELECT_SELF_ROOM  https://github.com/Deathangel908/pychat/blob/master/chat/settings.py#L292-L303 doesnt work with mariadb engine 10.1
* also admin email wasn't triggered while SELECT_SELF_ROOM has failed
