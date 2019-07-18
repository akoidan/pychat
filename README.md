<p align="center"><img src="./logo/logo.svg"></p>

![Docker Cloud Build Status](https://img.shields.io/docker/cloud/build/deathangel908/pychat.svg?label=docker%3Aprod)[![Scrutinizer Code Quality](https://scrutinizer-ci.com/g/Deathangel908/pychat/badges/quality-score.png?b=master)](https://scrutinizer-ci.com/g/Deathangel908/pychat/?branch=master) [![Code Health](https://landscape.io/github/akoidan/pychat/master/landscape.svg?style=flat&v=1)](https://landscape.io/github/akoidan/pychat/master) [![Codacy Badge](https://api.codacy.com/project/badge/Grade/b508fef8efba4a5f8b5e8411c0803af5)](https://www.codacy.com/app/nightmarequake/pychat?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=Deathangel908/pychat&amp;utm_campaign=Badge_Grade)

# Live demo: [pychat.org](https://pychat.org/) [Tutorial video](https://www.youtube.com/watch?v=m6sJ-blTidg)

# Table of contents
  * [About](#about)
  * [Breaf description](#brief-description)
  * [When should I use pychat](#when-should-i-use-pychat)
  * [How to run on my own server](#how-to-run-on-my-own-server)
    * [Run test docker image](#run-test-docker-image)
    * [Run prod docker image](#run-prod-docker-image)
    * [Run without docker](#run-without-docker)
  * [Contributing and development setup](#contributing-and-development-setup)
  
# About
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

# Brief description
Pychat is written in **Python** with [django](https://www.djangoproject.com/). For handling realtime messages [WebSockets](https://en.wikipedia.org/wiki/WebSocket) are used: browser support on client part and asynchronous framework [Tornado](http://www.tornadoweb.org/) on server part. Messages are being broadcast by means of [redis](http://redis.io/) [pub/sub](http://en.wikipedia.org/wiki/Publish%E2%80%93subscribe_pattern) feature using [tornado-redis](https://github.com/leporo/tornado-redis) backend. Redis is also used as django session backend and for storing current users online. For video call [WebRTC](https://webrtc.org/) technology was used with stun server to make a connection, which means you will always get the lowest ping and the best possible connection channel. Client part is written with progressive js framework [VueJs](https://vuejs.org/) which means that pychat is SPA, so even if user navigates across different pages websocket connection doesn't break. Pychat also supports OAuth2 login standard via FaceBook/Google. Css is compiled from [sass](http://sass-lang.com/guide). Server side can be run on any platform **Windows**, **Linux**, **Mac**. Client (users) can use Pychat from any browser with websocket support: IE11, Edge, Chrome, Firefox, Android, Opera, Safari...

# When should I use pychat:
By this time there're a lot of chats: skype, telegram, discord, slack, viber... What is the purpose of one more? Well, here's why:
 - You need a private chat for your company. Maybe you want to share it over private network, so only some people can access it.
 - You don't want your entire chat to be managable by 3rd party SaaS. 3rd party services can compromise your data or just disappear one day. You may also google for history leaks. Only with pychat you gain full controll over your chat.
 - You don't want to spend a penny on chat. While most of service come free in standard edition, they are still making money from you somehow. And when you've been using them a while, once you will discover that the feature that you need is paid. Forget about it all! Every single feature is free in pychat!
 - You need a custom feature in your chat that no other solutions provide. Codding chat from the scratch is really a quite long way (oh believe me). Just fork pychat and code anything you want there.
 - You just want the running chat and you don't have time on this nonsence. Follow the [Build docker](#build-docker) section. It's takes only a few minutes to setup an instance.

# How to run on my own server:
You can always use [pychat.org](https://pychat.org), but if you want run Pychat yourself you have 3 options:
 - Test pychat with prebuilt docker image
 - Build docker image for production/test
 - Run Pychat for development
 - Set up for production w/o docker

## Run test docker image
Please don't use this build for production, as it uses debug ssl certificate, lacks a few features and all files are located inside of container, meaning you will lose all data on container destroy.

 - Download and run image: 
 ```bash
 docker run -p 443:443 deathangel908/pychat-test
 ```
 - Open https://localhost

## Run prod docker image

 - You need create ssl certificates: `server.key` and `certificate.crt`. For example 
```bash
openssl req -nodes -new -x509 -keyout server.key -out certificate.crt -days 3650
```

 - Download [settings_example.py](chat/settings_example.py) into `settings.py` and edit it according comments in it.
  
 - Download [production.json](docker/pychat.org/production.json) and edit it according [wiki](fe#build-configuration)
 
 - Create volume and copy files there
 ```bash
 docker volume create pychat_data
 containerid=`docker container create --name dummy -v pychat_data:/data hello-world`
 docker cp settings.py dummy:/data
 docker cp production.json dummy:/data
 docker cp certificate.crt dummy:/data
 docker cp server.key dummy:/data
 docker rm dummy
 ```
 If you need to edit files inside container you can use 
 ```bash
docker run -i -t -v pychat_data:/tmp -it alpine /bin/sh
```

 - Run image with:
```bash
docker run -v pychat_data:/data -p 443:443 deathangel908/pychat
```
 - Open [https://localhost](https://localhost) and enjoy it!

## Run without docker
Take a look at [INSTALL.md](INSTALL.md#production-setup)

# Contributing and development setup:

To run chat in development take a look at [INSTALL.md](INSTALL.md) 

For development tips also check [Contributing.md](/CONTRIBUTING.md)
