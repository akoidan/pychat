<p align="center"><img src="./logo/logo.svg"></p>

 [![Docker Cloud Build Status](https://img.shields.io/docker/cloud/build/deathangel908/pychat.svg?label=docker%3Aprod)](https://hub.docker.com/r/deathangel908/pychat)
[![Docker Cloud Build Status](https://img.shields.io/docker/cloud/build/deathangel908/pychat-test.svg?label=docker%3Atest)](https://hub.docker.com/r/deathangel908/pychat-test) [![Scrutinizer Code Quality](https://scrutinizer-ci.com/g/Deathangel908/pychat/badges/quality-score.png?b=master)](https://scrutinizer-ci.com/g/Deathangel908/pychat/?branch=master) [![Codacy Badge](https://api.codacy.com/project/badge/Grade/b508fef8efba4a5f8b5e8411c0803af5)](https://www.codacy.com/app/nightmarequake/pychat?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=Deathangel908/pychat&amp;utm_campaign=Badge_Grade)

# Live demo: [pychat.org](https://pychat.org/) [Tutorial video](https://www.youtube.com/watch?v=m6sJ-blTidg)

# Table of contents
  * [About](#about)
  * [When should I use pychat](#when-should-i-use-pychat)
  * [Get started](#get-started)
    * [Run test docker image](#run-test-docker-image)
    * [Run prod docker image](#run-prod-docker-image)
    * [Run without docker](#run-without-docker)
  * [Contributing and development setup](#contributing-and-development-setup)
  
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
| Mobile phone call      | -      | -     | +/-   | -        | +/-   |
| Desktop client         | +      | +     | +     | +        | +/-   |
| Mobile client*         | -      | +     | +     | +        | +/-   |
| 3rd-party integration  | -      | +     | -     | -        | -     | 

*1 - Cordova project is in fe directory, coming soon

# Get started:
You can always use [pychat.org](https://pychat.org), but if you want to run Pychat yourself you have options below:

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
 - Download [settings.py](https://github.com/akoidan/pychat/blob/master/chat/settings_example.py) and edit it according comments in it.
 - Download [production.json](https://github.com/akoidan/pychat/blob/master/docker/pychat.org/production.json)  and edit it according [wiki](https://github.com/akoidan/pychat/tree/master/fe#configuration)
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

## Run without docker
Take a look at [INSTALL.md](https://github.com/akoidan/pychat/blob/master/INSTALL.md)

# Desktop client
Pychat uses websql and built the way so it renders everything possible w/o network. Use [nativifier](https://github.com/jiahaog/nativefier#installation) to create a client:

```bash
npx run nativifier pychat.org
```
If you're bulding a client for server, use it instead of pychat.org

# Contributing and development setup:

- To run chat in development take a look at [INSTALL.md](https://github.com/akoidan/pychat/blob/master/INSTALL.md) 
- For development tips also check [CONTRIBUTING.md](https://github.com/akoidan/pychat/blob/master/CONTRIBUTING.md)
