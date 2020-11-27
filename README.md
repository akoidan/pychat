[![Docker Cloud Build Status](https://img.shields.io/docker/cloud/build/deathangel908/pychat.svg?label=docker%3Aprod)](https://hub.docker.com/r/deathangel908/pychat)
[![Docker Cloud Build Status](https://img.shields.io/docker/cloud/build/deathangel908/pychat-test.svg?label=docker%3Atest)](https://hub.docker.com/r/deathangel908/pychat-test) [![Scrutinizer Code Quality](https://scrutinizer-ci.com/g/Deathangel908/pychat/badges/quality-score.png?b=master)](https://scrutinizer-ci.com/g/Deathangel908/pychat/?branch=master) [![Codacy Badge](https://api.codacy.com/project/badge/Grade/b508fef8efba4a5f8b5e8411c0803af5)](https://www.codacy.com/app/nightmarequake/pychat?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=Deathangel908/pychat&amp;utm_campaign=Badge_Grade)[![Code Health](https://landscape.io/github/akoidan/pychat/master/landscape.svg?style=flat&v=1)](https://landscape.io/github/akoidan/pychat/master) [![Upload Frontend pychat.org](https://github.com/akoidan/pychat/workflows/FE:pychat.org/badge.svg?branch=master)](https://github.com/akoidan/pychat/actions?query=workflow%3AFE%3Apychat.org) [![Refresh backend pychat.org](https://github.com/akoidan/pychat/workflows/BE:pychat.org/badge.svg?branch=master)](https://github.com/akoidan/pychat/actions?query=workflow%3ABE%3Apychat.org)

# Live demo: [pychat.org](https://pychat.org/), [video](https://www.youtube.com/watch?v=m6sJ-blTidg)

## Table of contents
- [About](#about)
- [When should I use pychat:](#when-should-i-use-pychat-)
  * [Run test docker image](#run-test-docker-image)
  * [Run prod docker image](#run-prod-docker-image)
  * [Native setup](#native-setup)
  * [Frontend](#frontend)
  * [Desktop app](#desktop-app)
  * [Android app](#android-app)
- [Development setup](#development-setup)
  * [Install OS packages](#install-os-packages)
  * [Bootstrap files:](#bootstrap-files-)
  * [Build frontend](#build-frontend)
  * [Configure IDEs if you use it:](#configure-ides-if-you-use-it-)
  * [Linting](#linting)
  * [Start services and run:](#start-services-and-run-)
- [Contribution guide](#contribution-guide)
  * [Description](#description)
  * [Shell helper](#shell-helper)
  * [Frontend logging](#frontend-logging)
  * [Icons](#icons)
  * [Sustaining online protocol](#sustaining-online-protocol)
  * [Database migrations](#database-migrations)
  * [Screen sharing for Chrome v71 or less](#screen-sharing-for-chrome-v71-or-less)
  * [WebRTC connection establishment](#webrtc-connection-establishment)
  * [Frontend Stack](#frontend-stack)
  * [Frontend config](#frontend-config)
- [Github actions](#github-actions)
- [TODO](#todo)

# About
This is free web (browser) chat, that features:
 - Sending instant text messages via websockets.
 - Sending images, smiles, anchors, embedded youtube, [giphy](https://giphy.com/), code [highlight](https://highlightjs.org/)
 - Making calls and video conference using [Peer to peer](https://en.wikipedia.org/wiki/Peer-to-peer) WebRTC.
 - Sharing screen during call or conference
 - Sending files directly to another PC (p2p) using WebRTC + FileSystem Api (up to 50MByte/s, limited by RTCDataChannel speed)
 - Editing images with [integrated painter](https://github.com/akoidan/spainter)
 - Login in with facebook/google oauth.
 - Sending offline messages with Firebase push notifications
 - Responsive interface (bs like)+ themes

# When should I use pychat:
|                        | Pychat | Slack | Skype | Telegram | Viber |
|------------------------|--------|-------|-------|----------|-------|
| Open Source            | +      | -     | -     | -        | -     |
| Free                   | +      | +/-   | +/-   | +        | +/-   |
| Screen sharing         | +      | +     | -     | -        | -     |
| Syntax highlight       | +      | -     | -     | -        | -     |
| Unlimited history      | +      | +/-   | +     | +        | +     |
| Audio/Video conference | +      | +     | +     | +        | -     |
| Can run on your server | +      | -     | -     | -        | -     |
| Audio/Video messages   | +      | -     | -     | +        | +     |
| P2P file sharing       | +      | -     | -     | -        | -     |
| Desktop client         | +      | +     | +     | +        | +/-   |
| Mobile client          | +      | +     | +     | +        | +     |
| GCM phone call         | -      | -     | +/-   | -        | +/-   |
| 3rd-party integration  | -      | +     | -     | -        | -     | 


## Run test docker image
Please don't use this build for production, as it uses debug ssl certificate, lacks a few features and all files are located inside of container, meaning you will lose all data on container destroy.

 - Download and run image: 
 ```bash
 docker run -tp 443:443 deathangel908/pychat-test
 ```
 - Open [https://localhost](https://localhost)

## Run prod docker image

 - You need create ssl certificates: `server.key` and `certificate.crt`. For example 
```bash
openssl req -nodes -new -x509 -keyout server.key -out certificate.crt -days 3650
```
 - Download [settings.py](https://github.com/akoidan/pychat/blob/master/backend/chat/settings_example.py) and edit it according comments in it.
 - Download [production.json](https://github.com/akoidan/pychat/blob/master/docker/pychat.org/production.json)  and edit it according [wiki](https://github.com/akoidan/pychat#frontend-config)
 - Create volume and copy files there
 ```bash
 docker volume create pychat_data
 containerid=`docker container create --name dummy -v pychat_data:/data hello-world`
 docker cp settings.py dummy:/data/settings.py
 docker cp production.json dummy:/data/production.json
 docker cp certificate.crt dummy:/data/certificate.crt
 docker cp server.key dummy:/data/server.key
 docker rm dummy
 ```
 If you need to edit files inside container you can use 
 ```bash
docker run -i -t -v pychat_data:/tmp -it alpine /bin/sh
```
 - Run image with:
```bash
docker run -t -v pychat_data:/data -p 443:443 deathangel908/pychat
```
 - Open [https://localhost](https://localhost) and enjoy it!

## Native setup
If you don't or unable to run docker you can alway do the setup w/o it. You definitely spend more time, so I would recommend to use docker if possible. But if you're still sure,  here's the setup for cent-os/archlinux based system:
 
 1. For production I would recommend to clone repository to `/srv/http/pychat`.  If you want to close the project into a different directory, replace all absolute paths in config files. You can use `download_content.sh rename_root_directory` to do that.
 1. Install packages:
     - For archlinux follow [Install OS packages](#install-os-packages), add add these ones: `pacman -S postfix gcc jansson`. 
     - For centos use add `alias yum="python2 $(which yum)"` to `/etc/bashrc` if you use python3. And then install that packages `yum install python34u, python34u-pip, redis, mysql-server, mysql-devel, postfix, mailx`
     - If you use another OS, try to figure out from [Install OS packages](#install-os-packages) guide which things you need
 1. If you want to use native file-uploader (`nginx_upload_module` written in `C`) instead of python uploader (which is a lot slower) you should build nginx yourself. For archlinux setup requires `pacman -S python-lxml gd make geoip`. To build nginx with this module run from the **root** user: `bash download_content.sh build_nginx 1.15.3 2.3.0`. And create dir + user `useradd nginx; install -d -m 0500 -o http -g http /var/cache/nginx/`. If you don't, just install nginx with your package manager: e.g. `pacman -S nginx` or `yum install nginx` on centos
 1. Follow [Bootstrap files](#bootstrap-files) flow.
 1. I preconfigued native setup for domain `pychat.org`, you want to replace all occurrences of `pychat.org` in [rootfs](rootfs) directory for your domain. To simplify replacing use my script: `./download_content.sh rename_domain your.new.domain.com`. Also check `rootfs/etc/nginx/sites-enabled/pychat.conf` if `server_name` section is correct after renaming.
 1. HTTPS is required for webrtc calls so you need to enable ssl:
   - Either create your certificates e.g. `openssl req -nodes -new -x509 -keyout server.key -out certificate.crt -days 3650`
   - Either use something like [certbot](https://certbot.eff.org/lets-encrypt/arch-nginx)
   - Either you already have certificates or already know how to do it.
 1. Open `/etc/nginx/sites-enabled/pychat.conf` and modify it by:
   - change `server_name` to one matching your domain/ip address
   - remove check for host below it, if you're using ip 
   - change `ssl_certificate` and `ssl_certificate_key` path to ones that you generated   
   - if you didn't compile nginx with `upload_file` module, remove locations `api/upload_file` and `@upload_file`, otherwise leave it as it is.
 1. Change to parent directory (which contains frontend and backend) and Copy config files to rootfs with from **root** user `sh download_content.sh copy_root_fs`.
 1. Create a directory `mkdir backend/downloading_photos` in the backend directory and give it access chmod 777 `downloading_photos` cDon't forget to change the owner of current (project) directory to `http` user: `chown -R http:http`. And reload systemd config `systemctl daemon-reload`. Also you
 1. Follow the [Frontend](#frontend) steps
 1. Generate postfix files: `install -d -m 0555 -o postfix -g postfix /etc/postfix/virtual; postmap /etc/postfix/virtual; newaliases; touch /etc/postfix/virtual-regexp; echo 'root postmaster' > /etc/aliases`
 1. Start services:
   - For archlinux/ubuntu: `packages=( mysqld redis tornado@8888 nginx postfix ) ; for package in "${packages[@]}" ; do systemctl enable $package; done;`. Service `mysqld` could be named `mysql` on Ubuntu.
   - For centos: `packages=( redis-server  nginx postfix mysqld tornado@8888) ; for package in "${packages[@]}" ; do service $package start; done;`
 1. You can also enable autostart (after reboot)
   - For archlinux/ubuntu: `packages=( redis  nginx postfix mysqld tornado) ; for package in "${packages[@]}" ; do systemctl start $package; done;`
   - For centos: `chkconfig mysqld on; chkconfig on; chkconfig tornado on; chkconfig redis on; chkconfig postfix on`
 1. Open in browser [http**s**://your.domain.com](https://127.0.0.1). Note that by default nginx accepts request by domain.name rather than ip.
 1. If something doesn't work you want to check logs:
   - Check logs in `pychat/backend/logs` directory. 
   - Check daemon logs: e.g. on Archlinux  `sudo journalctl -u YOUR_SERVICE`. Where YOUR_SERVICE could be: `nginx`, `mysql`, `tornado`
   - Check that user `http` has access to you project directory, and all directories inside, especially to `/photos` 

## Frontend
 - `cd frontend; nvm install; nvm use`.
 - `yarn install --frozen-lockfile`
 - Create production.json based on [Frontend config](#frontend-config). Also you can use and modify `cp docker/pychat.org/production.json ./frontend/`
 - Run `yarn run prod`. This generates static files in `frotnend/dist` directory.

## Desktop app
Pychat uses websql and built the way so it renders everything possible w/o network. You have 2 options:

### Natifier
Use [nativifier](https://github.com/jiahaog/nativefier#installation) to create a client (replace pychat.org for your server): `npx run nativifier pychat.org`

### Electron
 - Create production.json based on [Frontend config](#frontend-config)
 - Run `cd frontend; yarn run electronProd`.

## Android app
This is harsh. If you're not familiar with android SDK I would recommend doing the steps below from AndroidStudio:
 - Install android sdk, android platform tools. accept license
 - Create production.json based on [Frontend config](#frontend-config)
 - production.json `"PUBLIC_PATH": "./"`,  `"BACKEND_ADDRESS": "pychat.org"` build into dist, rm .gz. , copy to `www`. In index.html include ` <script src="cordova.js"></script>`
 - `bash download_content.sh android`
 
Example for mac:

 1. Download oracle jdk-8
 1. Install android studio
 1. Run android studio that will install Android sdk for you
 1. Accept licence with `~/Library/Android/sdk/tools/bin/sdkmanager --licenses`
 1. Install [gradle](https://gradle.org/install/). `brew install gradle` 
 1. Open `frontend/platforms/android` with androidStudio
 1. Start android emulator / connect device
 1. put index.html into www
 1. Run dev server with `yarn run dev`; `bash download_content.sh android`
 1. TO debug java files you can run it directory from android studio. `Debug` button should be available out of the box after openning a project
 1. To debug js you can open `chrome://inspect/#devices` in chrome 
 1. For any question check [cordova docs](https://cordova.apache.org/docs/en/latest/guide/platforms/android/index.html#installing-the-requirements)

# Development setup

The flow is the following
 - Install OS packages depending on your OS type
 - Bootstrap files
 - Build frontend
 - Start services and check if it works

## Install OS packages
This section depends on the OS you use. I tested full install on Windows/Ubuntu/CentOs/MacOS/Archlinux/Archlinux(rpi3 armv7). [pychat.org](https://pychat.org) currently runs on Archlinux Raspberry Pi 3.

### [Windows](https://www.microsoft.com/en-us/download/windows.aspx):
 1. Install [python](https://www.python.org/downloads/) with pip. only **Python 3.6**+ is **required**
 2. Add **pip** and **python** to `PATH` variable.
 3. Install [redis](https://github.com/MSOpenTech/redis/releases). Get the newest version or at least 2.8.
 5. Install [mysql](http://dev.mysql.com/downloads/mysql/). You basically need mysql server and python connector.
 6. You also need to install python's **mysqlclient**. If you want to compile one yourself you need to **vs2015** tools. You can download [visual-studio](https://www.visualstudio.com/en-us/downloads/download-visual-studio-vs.aspx) and install [Common Tools for Visual C++ 2015](http://i.stack.imgur.com/J1aet.png). You need to run setup as administrator. The only connector can be found [here](http://dev.mysql.com/downloads/connector/python/). The wheel (already compiled) connectors can be also found here [Mysqlclient](http://www.lfd.uci.edu/~gohlke/pythonlibs/#mysqlclient). Use `pip` to install them.
 7. Add bash commands to `PATH` variable. **Cygwin** or **git's** will do find.(for example if you use only git **PATH=**`C:\Program Files\Git\usr\bin;C:\Program Files\Git\bin`).
 1. Install [nvm](https://github.com/coreybutler/nvm-windows). 

### [Ubuntu](http://www.ubuntu.com/):
 1. Install required packages: `apt-get install python pip mysql-server libmysqlclient-dev` (python should be 3.6-3.8) If pip is missing check `python-pip`. For old versions of Ubuntu you can use this ppa: `sudo add-apt-repository ppa:deadsnakes/ppa; sudo apt-get update; sudo apt-get install python3.8 python3.8-dev python3.8-venv python3.8-apt; curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py; python3.8 get-pip.py` 
 1. Install **redis** database: `add-apt-repository -y ppa:rwky/redis; apt-get install -y redis-server`
 1. Install mysqlclient `pip install mysqlclient==1.3.13`
 1. Install [nvm](https://qiita.com/shaching/items/6e398140432d4133c866)

### [Archlinux](https://www.archlinux.org/):
 1. Install system packages:  `pacman -S unzip python python-pip redis yarn mariadb python-mysqlclient`. nvm is located in [aur](https://aur.archlinux.org/packages/nvm/) so `yay -S nvm` (or use another aur package)
 2. If you just installed mariadb you need to initialize it: `mysql_install_db --user=mysql --basedir=/usr --datadir=/var/lib/mysql`.
 
### [MacOS](https://en.wikipedia.org/wiki/MacOS)
 1. Install packages: `brew install mysql redis python3` 
 1. Start services `brew services run mysql redis`
 1. Install mysqlclient `pip install mysqlclient`

## Bootstrap files:
 1. I use 2 git repos in 2 project directory. So you probably need to rename `excludeMAIN`file to `.gitignore`or create link to exclude. `ln -rsf .excludeMAIN .git/info/exclude`
 2. Rename [backend/chat/settings_example.py](backend/chat/settings_example.py) to `backend/chat/settings.py`. **Modify file according to the comments in it.** 
 3. From backend dir (`cd backend`). Create virtualEnv `python3 -m venv --system-site-packages .venv`. For ubuntu you can omit `--system-site-packages `. Activate it: `source .venv/bin/activate`
 4. Install python packages with `pip install -r requirements.txt`. (Remember you're still in `backend` dir)
 5. From **root** (sudo) user create the database (from shell environment): `echo "create database pychat CHARACTER SET utf8 COLLATE utf8_general_ci; CREATE USER 'pychat'@'localhost' identified by 'pypass'; GRANT ALL ON pychat.* TO 'pychat'@'localhost';" | mysql -u root`. You will need mysql running for that (e.g. `systemctl start mysql` on archlinux) If you also need remote access do the same with `'192.168.1.0/255.255.255.0';`
 6. Fill database with tables: `bash ../download_content.sh create_django_tables`. (Remember you're still in `backend` dir)

## Build frontend
Change to frontend directory `cd frontend` I would recommend to use node version specified in nvm, so  `nvm install; nvm use`.
 - To get started install dependencies first: `yarn install --frozen-lock` # or use npm if you're old and cranky
 - Take a look at copy [development.json](frontend/development.json). The description is at [Frontend config](#frontend-config)
 - Webpack-dev-server is used for development purposes with hot reloading, every time you save the file it will automatically apply. This doesn't affect node running files, only watching files. So files like builder.js or development.json aren't affected. To run dev-server use `yarn run dev`. You can navigate to http://localhost:8080. If requests don't work, apply self-signed certificate by navigating to http://localhost:8888
 - To build android use `yarn run android -- 192.168.1.55` where 55 is your bridge ip address
 - To run electron use `yarn run electronDev`. This will start electron dev. and generate `/tmp/electron.html` and `/tmp/electron.js` 

## Configure IDEs if you use it:

### Pycharm
 1. I recommend open `backend` as root directory for pycharm.
 1. Django support should be enabled by default when you open this project. If it doesn't happen go to Settings -> Languages and Framework -> Django -> Enable django support. 
   - Django project root: `backend`
   - Put `Settings:` to `chat/settings.py`
 1. If pycharm didn't configure virtualenv itself. Go to `Settings` -> `Project backend` -> `Project Interpreter` -> `Cogs in right top` -> 'Add' -> `Virtual Environment` -> `Existing environment` -> `Interpereter` = `pychatdir/.venv/bin/python`. Click ok. In previous menu on top 'Project interpreter` select the interpriter you just added.
 1. `Settings` -> `Project backend` -> `Project structure`
  - You might want to exclude: `.idea`
  - mark `templates` directory as `Template Folder`
 1. Add tornado script: `Run` -> `Edit configuration` ->  `Django server` -> Checkbox `Custom run command` `start_tornado`. Remove port value.
 
## Linting
 - atm frontend linting is only available, so `cd frotnend`
 - https://eslint.vuejs.org/rules/this-in-template.html
 
Current linting supports:

 - Sass is linted with [stylelint](https://stylelint.io/user-guide/rules) configured with [.stylelintrc](frontend/.stylelintrc)
 - Typescript are linted with eslint, along with .vue files [eslint-plugin-vue](https://eslint.vuejs.org/rules/this-in-template.html) configured with [.eslintrc.json](frontend/.eslintrc.json)

### Webstorm
 
#### Set template
 1. New
 2. Edit files templates...
 3. Vue single file component

```vue
<template>
    <div>#[[$END$]]#</div>
</template>

<script lang="ts">
  import {State} from '@/utils/store';
  import {Component, Prop, Vue, Watch, Ref} from 'vue-property-decorator';

  @Component
  export default class ${COMPONENT_NAME} extends Vue {
   
  }
</script>
<style lang="sass" scoped>

</style>
```

#### Change linting settings

Disable tslint, since it's not used, and enable eslint:

 1. Settings
 2. Typescript
 3. Tslint
 4. Disable tslint

 
#### Enable aliases for webpack
 - to resolve absolute path for webpack webstorm requires webpack.config.js. Go to settings -> javascript -> webpack -> Webpack config file   

## Start services and run:
 - Start `mysql` server if it's not started.
 - Start session holder: `redis-server`
 - Start webSocket listener: `python manage.py start_tornado`
 - Open in browser [http**s**://127.0.0.1:8080](https://127.0.0.1:8080).
 - Add self signed ssl certificate provided by [django-sslserver](https://github.com/teddziuba/django-sslserver/blob/master/sslserver/certs/development.crt) to browser exception. For chrome you can enable invalid certificates for localohost in [chrome://flags/#allow-insecure-localhost](chrome://flags/#allow-insecure-localhost). Or for others open [https://localhost:8888](https://localhost:8888) and [https://localhost:8000](https://localhost:8000). Where `8888` comes from `start_tornado.py`

# Contribution guide

## Description
Pychat is written in [Python](https://www.python.org/) and [typescript](https://www.typescriptlang.org/). For handling realtime messages [WebSockets](https://en.wikipedia.org/wiki/WebSocket) are used: browser support on client part and asynchronous framework [Tornado](http://www.tornadoweb.org/) on server part. For ORM [django](https://www.djangoproject.com/) was used with [MySql](https://www.mysql.com/) backend. Messages are being broadcast by means of [redis](http://redis.io/) [pub/sub](http://en.wikipedia.org/wiki/Publish%E2%80%93subscribe_pattern) feature using [tornado-redis](https://github.com/leporo/tornado-redis) backend. Redis is also used as django session backend and for storing current users online. For video call [WebRTC](https://webrtc.org/) technology was used with stun server to make a connection, which means you will always get the lowest ping and the best possible connection channel. Client part is written with progressive js framework [VueJs](https://vuejs.org/) which means that pychat is SPA, so even if user navigates across different pages websocket connection doesn't break. Pychat also supports OAuth2 login standard via FaceBook/Google. Css is compiled from [sass](http://sass-lang.com/guide). Server side can be run on any platform **Windows**, **Linux**, **Mac**. Client (users) can use Pychat from any browser with websocket support: IE11, Edge, Chrome, Firefox, Android, Opera, Safari...

## Shell helper
Execute `bash download_content.sh` it will show you help.

## Frontend logging
By default each user has turned off browser (console) logs. You can turn them on in [/#/profile](https://localhost:8000/#/profile) page (`logs` checkbox). All logs are logged with `window.logger` object, for ex: `window.logger('message')()`. Note that logger returns a function which is binded to params, that kind of binding shows corrent lines in browser, especially it's handy when all source comes w/o libraries/webpack or other things that transpiles or overhead it. You can also inspect ws messages [here](ws_messages.jpeg) for chromium. You can play with `window.wsHandler.handleMessage(object)` and `window.wsHandler.handle(string)` methods in debug with messages from log to see what's going on

## Icons
Chat uses [fontello](fontello.com) and its api for icons. The decision is based on requirements for different icons that come from different fonts and ability to add custom assets. Thus the fonts should be generated (`.wolf` etc). W/o this chat would need to download a lot of different fonts which would slow down the loading process. You can easily edit fonts via your browser, just execute `bash download_content.sh post_fontello_conf`. Make your changes and hit "Save session". Then execute `bash download_content.sh download_fontello`. If you did everything right new icons should appear under [frontend/src/assets/demo.html](frontend/src/assets/demo.html)

## Sustaining online protocol
Server pings clients every PING_INTERVAL miliseconds. If client doesn't respond with pong in PING_CLOSE_JS_DELAY, server closes the connection. If ther're multiple tornado processes if can specify port for main process with MAIN_TORNADO_PROCESS_PORT. In turn the client expects to be pinged by the server, if client doesn't receive ping event it will close the connection as well. As well page has window listens for focus and sends ping event when it receives it, this is handy for situation when pc suspends from ram.

## Database migrations
Pychat uses standard [django migrations](https://docs.djangoproject.com/en/1.11/topics/migrations/) tools. So if you updated your branch from my repository and database has changed you need to `./manage.py makemigration` and  `./manage.py migrate`. If automatic migration didn't work I also store migrations in [migration](migrations).  So you might take a look if required migration is there before executing commands. If you found required migration in my repo don't forget to change `Migration.dependencies[]` and rename the file.

## Screen sharing for Chrome v71 or less
ScreenShare available for Chrome starting from v71. For chrome v31+ you should install an extension. It uses `chrome.desktopCapture` feature that is available only via extension. The extension folder is located under [screen_cast_extension](screen_cast_extension)`.
If you want to locally test it:

 - Open `chrome://extensions/` url in chrome and verify that `developer mode` checkbox is checked.
 - In the same tab click on `load unpacked extension...` button and select [screen_cast_extension](screen_cast_extension) directory.
 - Note that in order to `background.js` be able to receive messages from webpage you need to add your host to `externally_connectable` section in  [manifest.json](screen_cast_extension/manifest.json)

Tp publish extension:
 - If you want to update existing extension don't forget to increment `version` in [manifest.json](package/manifest.json).
 - Zip [screen_cast_extension](screen_cast_extension) directory into e.g. `bash download_content.sh zip_extension`
 - Upload archive `extension.zip` to [chrome webstore](https://chrome.google.com/webstore/developer/dashboard) (Note, you need to have a developer account, that's 5$ worth atm).

## WebRTC connection establishment
The successful connection produces logs below in console

Sender:
```
ws:in {"action": "offerCall", "content": {"browser": "Chrome 86"}, "userId": 2, "handler": "webrtc", "connId": "YZnbgKIL", "opponentWsId": "0002:UFBW", "roomId": 1, "time": 1604446797449}
WRTC Setting call status to  received_offer    
WRTC CallHandler initialized
ws:out  {"action":"replyCall","connId":"YZnbgKIL","content":{"browser":"Chrome 86"},"messageId":1} 
rsok33GN CallHandler initialized
rsok33GN:0005:EJAd Created CallSenderPeerConnection
WRTC Setting call status to  accepted
WRTC capturing input
WRTC navigator.mediaDevices.getUserMedia({audio, video})
ws:out  {"action":"acceptCall","connId":"YZnbgKIL","messageId":2}
YZnbgKIL:0002:UFBW Connect to remote  
rsok33GN:0005:EJAd Creating RTCPeerConnection
YZnbgKIL:0002:UFBW Sending local stream to remote
rsok33GN:0005:EJAd Creating offer...
rsok33GN:0005:EJAd Created offer, setting local description
rsok33GN:0005:EJAd Sending offer to remote
YZnbgKIL:0002:UFBW onicecandidate
...
YZnbgKIL:0002:UFBW onicecandidate
rsok33GN:0005:EJAd onsendRtcData
rsok33GN:0005:EJAd answer received
rsok33GN:0005:EJAd onaddstream
rsok33GN:0005:EJAd onsendRtcData
```

Receiver:
```
WRTC capturing input
WRTC navigator.mediaDevices.getUserMedia({audio, video})
WRTC got local stream  MediaStream {id: "0IeyYT9LxHRidUZaw7XSVnXEPWYimm4KDmJB", active: true, onaddtrack: null, onremovetrack: null, onactive: null, …}
WRTC Setting call status to  sent_offer
ws:out  {"action":"offerCall","roomId":1,"content":{"browser":"Chrome 86"},"messageId":1}
ws:in {"action": "setConnectionId", "handler": "void", "connId": "YZnbgKIL", "messageId": 1, "time": 1604446797449}   
rsok33GN CallHandler initialized
rsok33GN:0004:oIc5 Created CallReceiverPeerConnection
YZnbgKIL:0001:qobF Connect to remote
rsok33GN:0004:oIc5 Creating RTCPeerConnection
YZnbgKIL:0001:qobF Sending local stream to remote
rsok33GN:0004:oIc5 onsendRtcData
rsok33GN:0004:oIc5 Creating answer
rsok33GN:0004:oIc5 onaddstream
rsok33GN:0004:oIc5 Sending answer
rsok33GN:0004:oIc5 onsendRtcData
rsok33GN:0004:oIc5 onsendRtcData
```

The string `rsok33GN:0005:EJAd` describes:
 - `rsok33GN` is ID of CallHandler
 - `0005` is Id of user
 - `EJAd` id of connection (`TornadoHandler.id`)
 
## Frontend Stack
The technologies stack used in project:
- Typescript
- Vue, Vuex, VueRouter, lines-logger
- Vuex-module-decorators, Vue-property-decorator
- Webpack and loaders
- Sass

[builder.js](frontend/builder.js) is used to build project. Take a look at it to understand how source files are being processed. Its start point is `entry: ['./src/main.ts']`. Everything is imported in this files are being processed by section `loaders`.

Every vue component has injected `.$logger` object, to log something to console use `this.logger.log('Hello {}', {1:'world'})();` Note calling function again in the end. Logger is disabled for production. For more info visit [lines-logger](https://github.com/akoidan/lines-logger)

This project uses [vue-property-decorator](https://github.com/kaorun343/vue-property-decorator) (that's has a dependency [vue-class-component](https://github.com/vuejs/vue-class-component)) [vuex-module-decorators](https://github.com/championswimmer/vuex-module-decorators). You should write your component as the following:

```typescript
import { Vue, Component, Prop, Watch, Emit, Ref } from 'vue-property-decorator'
import {userModule, State} from '@/utils/storeHolder'; // vuex module example


@Component
export class MyComp extends Vue {
  
  @Ref
  button: HTMLInputElement;

  @Prop readonly propA!: number;
  
  @State
  public readonly users!: User[];

  @Watch('child')
  onChildChanged(val: string, oldVal: string) { }

  @Emit() 
  changedProps() {}

  async created() {
    userModule.setUsers(await this.$api.getUsers());
  }
}
```

## Frontend config
development.json and production.json have the following format:
```json
{
  "BACKEND_ADDRESS": "e.g. pychat.org:443, protocol shouldn't be there, note there's no trailing slash, you can specify '{}' to use the same host as files served with",
  "IS_DEBUG": "set true for development and debug mode enabled",
  "UGLIFY": "true/false uglifies js/css so it has less weight, set this for production.json only, when you're sue you don't need to debug the output",
  "GOOGLE_OAUTH_2_CLIENT_ID" : "check chat/settings_example.py",
  "FACEBOOK_APP_ID": "check chat/settings_example.py",
  "MANIFEST": "manifest path for firebase push notifications e.g.`/manifest.json`",
  "RECAPTCHA_PUBLIC_KEY": "check chat/settings_example.py RECAPTCHA_SITE_KEY",
  "AUTO_REGISTRATION": "if set to true, for non loggined user registration page will be skipped with loggining with random generated username. Don't use RECAPTCHA with this key",
  "PUBLIC_PATH": "Set this path if you have different domains/IPs for index.html and other static assets, e.g. I serve index.html directly from my server and all sttatic assets like main.js from CDN, so in my case it's 'https://static.pychat.org/' note ending slash",
  "ISSUES": "if true navigation bar will display link to reporting a issue page",
  "STATISTICS": "if true navigation bar will display a link to a page with statistics user by country",
  "GITHUB_LINK": "an external link to project source files, in my case https://github.com/Deathangel908/pychat . Set to false if you don't wanna see it in the navbar",
  "PAINTER": "if true chat will contain a link to painter page in the navbar. This you can draw any images and send to chat",
  "FLAGS": "if true, a user name will contain a country icon on the right. User names are shown on the right section of the screen"
}
```

# Github actions
In order to setup continuous delivery via github:
- Generate a new pair of ssh keys `mkdir /tmp/sshkey; ssh-keygen -t rsa -b 4096 -C "github actions" -f  /tmp/sshkey/id_rsa`
- put `/tmp/sshkey/id_rsa.pub` to server `~/.ssh/authorized_keys` where `~` is the home for ssh user to use ( I used `http`) 
- Create ssh variables at https://github.com/akoidan/pychat/settings/secrets/actions (where akoidan/pychat is your repo) :
   - `HOST` -ssh host (your domain)
   - `PORT` - ssh port (22)
   - `SSH_USER` - ssh user, if you used my setup it's `http`
   - `ID_RSA` - what ssh-keygen has generated in step above to`/tmp/sshkey/id_rsa`
- I used alias to give http user to access tornado systemd service like in [this](https://serverfault.com/a/841104/304770) example. So append `/etc/sudoers` with
 ```
Cmnd_Alias RESTART_TORNADO = /usr/bin/systemctl restart tornado
http ALL=(ALL) NOPASSWD: RESTART_TORNADO
``` 

# TODO
* FB login doesn't return email refactor for google_id and fb_id in user_profile . It only returns email for me
* when we store blobs, we should use URL.revokeObjectURL(this.src); (it's usually when we do URL.createObjectURL)
* if users joins a room that already has call in progress, he should be able to join this call
* create npm package for fontello instead of download_content.sh . move config with files location to package.json or fontello.json https://stackoverflow.com/questions/46725374/how-to-run-a-script-before-installing-any-npm-module
* opening devtools causing div $('.chatBoxHolder.holder') to have horizontal scroll. by disabling and enabling 'flex: 1' css on it, scroll dissappears 
* download files with backgroun fetch https://developers.google.com/web/updates/2018/12/background-fetch
* use native filesystemAPI to send files, so after refreshing the page we still have access https://www.youtube.com/watch?v=GNuG-5m4Ud0&ab_channel=GoogleChromeDevelopers
* .stylelintignore @for loops doesn't work in linter https://github.com/AleshaOleg/postcss-sass/issues/53
* https://www.infoworld.com/article/3443039/typescript-37-beta-debuts-with-optional-chaining.html
* get\s+(\w+)\(\):\s+((\w|\[|\])+)\s+\{\s+return\s+store\.\w+\;?\s+\}\;?        @State\n    public readonly $1!: $2;
* purge all callbacks to async code
* npm run stats
* Add google and fb auth via iframe 
* compile to bytenode for electron https://github.com/OsamaAbbas/bytenode
* Add codepart to live code
* https://static.pychat.org/main.js?5db3927a045ba970fade:17390:17 Uncaught Error: setLocalStreamSrc roomDict {}, {"id":1,"state":null} OBJ:  Error: setLocalStreamSrc roomDict {}, {"id":1,"state":null}
* "unable to begin transaction (3850 disk I/O error)" when 2 tabs are opened
* Add search for roomname in rooms list and username for user in direct messages and user in room
* Save message upon typing in localstorage and restore it on page load, be aware of pasted files
* Add linter badges for typescript, test badges for tornado and backend, code coverage etc
* Update to tornado 6.0 and detect blocking loops https://stackoverflow.com/a/26638397/3872976
* https://stackoverflow.com/questions/33170016/how-to-use-django-1-8-5-orm-without-creating-a-django-project
* tornado uses blocking operation like django orm or sync_redis (strict redis). While this operations are executed main thread awaits IO and prevents new messages and connections from execution. async_redis create cb wrapper. django orm: https://docs.djangoproject.com/en/dev/releases/3.0/#asgi-support
* Replace email login to google_user_id and fb_user_id so we could detach oauth2 account
* Add smile reaction to the message below it, like in slack
* https://www.w3.org/TR/css-scrollbars-1/
* Search add user to room should container user icon
* add webhooks, move giphy to webhooks, add help command
* https://www.nginx.com/resources/wiki/modules/upload/
* Store image in filstream api
* add srcset and minify uploaded image 
* Update to tornado 6.0 and detect blocking loops https://stackoverflow.com/a/26638397/3872976
* https://stackoverflow.com/questions/33170016/how-to-use-django-1-8-5-orm-without-creating-a-django-project
* tornado uses blocking operation like django orm or sync_redis (strict redis). While this operations are executed main thread awaits IO and prevents new messages and connections from execution. async_redis create cb wrapper. django orm: https://docs.djangoproject.com/en/dev/releases/3.0/#asgi-support
* autoupdate pychat.org from github webhook and expose port http to build
* If self assigned certificate was used, mb add user an option to click on iframe or smth?
* Giphy: The gif-picture won't change after editing and leaving it's name. But there are tons of other gifs under every tag. 
* If user A was online in Brower BA and he didn't have any history, when he joins online from browser B and send the message, it won't appear on browser BA when he opens ba.
* RoomUsers should have disabled instead of Room, so when user leaves direct messages, another one doesn't exit it. But in case of new message, user just doesn't receive any... Mb we can make them hidden in UI
* Merge base.js into chat.js so 1 request less
* https://github.com/tornadoweb/tornado/issues/2243
* Add sound/video messages like in telegram
* Add webrtc peer to peer secure chats (like telegrams)
* output logs to kibana
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
* Remove django server and leave only tornado
* send image to chat if error on server or inet goes down while uploading - we don't have an option to retry
* Add linters like on webpack-vue-typescript
* ADD ability to change theme during registration
* add ability to cancel filetransfer on sender side
* add aliases to webpack
* add test
* add tslint
* add sass-lint
* resolve sw.ts imports doesn't work with ts-loader + file-loaders
