Table of contents
=================
  * [Draw-io uml diagramm](#draw-io)
  * [Djangochat-config submodule](#djangochat-config)
  * [Frontend logging](#frontend-logging)
  * [Smileys](#smileys)
  * [Icons](#icons)

draw-io
=======
Webrtc frontend classes diagram you can find [here](https://www.draw.io/?lightbox=1&highlight=0000ff&edit=_blank&layers=1&nav=1&title=draw.io-uml_diagram.xml#Uhttps%3A%2F%2Fraw.githubusercontent.com%2FDeathangel908%2Fdjangochat-config%2Fmaster%2Fdraw.io-uml_diagram.xml).

djangochat-config
=================
All self-writted code (text) is stored in [djangochat](/README.md) repository. While all binary files, generated codes, diagrams, fontello icons, even base64 sass is stored in a [separate repository](https://github.com/Deathangel908/djangochat-config) that is named as djangochat-config. As current repository has it as sumbodule. You can clone it with `git submodule update --init djangochat-config`. `djangochat` always refers to specific commit of `djangochat-config` which you can view with `git ls-tree HEAD djangochat-config`. So if you changed something in `djangochat-config` and you want it to appear in `djangochat` repository you need to commit and **push** in `./djangochat-config` submodule, add submodule change with `git commit -m "message" ./djangochat-config` and then execute [download_content.sh](download_content.sh). If you view this script it has `declare -a files=(\` which are gonna be downloaded to `djangochat` repository. If you add something new don't forget to add it to `.gitignore`. The whole idea of having a separate repository is a bit messy, but I'm gonna stick with it to keep `djangochat` repository as light as possible until I stop experimenting with heavy files that used and removed over and over again.


Frontend logging
=================
By default each user has turned off browser (console) logs. You can turn them on in [/#/profile](https://localhost:8000/#/profile) page (`logs` checkbox). All websocket/rest packets will be logged in console then. You can also inspect ws messages [here](https://github.com/Deathangel908/djangochat-config/blob/master/ws_messages.jpeg?raw=true) for chromium. `wsHandler` takes care of handling those messages. It has `handleMessage(object)` and `handle(string)` methods. You can play with both in debug to see what's going on.

Smileys
=======
All scripts to extract smiles located in [djangochat-config](https://github.com/Deathangel908/djangochat-config) in [smileys](https://github.com/Deathangel908/djangochat-config/tree/master/smileys) directory. By default chat uses smileys extracted from  [DefaultSmileys.cpack](https://github.com/Deathangel908/djangochat-config/blob/master/smileys/DefaultSmilies.cfpack) [commfort](http://www.commfort.com/en/) chat.
You can take a look at scripts located there to understand what's going on. If you just want to add an icon/gif you already have - just add it's base64 value to [smileys_data.js](https://github.com/Deathangel908/djangochat-config/blob/master/static/js/smileys_data.js) and follow [djangochat-config](#djangochat-config) section instructions to apply change to main repo.

Icons
=====
To add a new icon you need to drag [djangochat-config/config.json](https://github.com/Deathangel908/djangochat-config/blob/master/config.json) into [fontello](http://fontello.com), click on new icon and on download webfont button. The archive with all icons will be downloaded. Then you need to extract archive into djangochat-config directory ( `config.json` would go to `/`, `css` `font` and `demo.html` to `/static`) You can use [djangochat-config/generate-fonts.sh](https://github.com/Deathangel908/djangochat-config/blob/master/generate-fonts.sh) for it. If you all did correctly `git status` should show that files were modified but not added. Commit and push this changes and follow [djangochat-config](#djangochat-config) section instructions to apply changed from submodule to main repository. If you all did right [demo.html](https://0.0.0.0:8000/static/demo.html) should show new icons

#Database migrations
I use standard [django migrations](https://docs.djangoproject.com/en/1.11/topics/migrations/) tools. So if you updated you branch from my repository and database has changed you need to `./manage.py makemigration` and  `./manage.py migrate`. If automatic migration didn't work I also store migrations in [djangochat-config/migration](https://github.com/Deathangel908/djangochat-config/tree/master/migrations).  So you might take a look if required migration is there before exeuting commands. Don't forget to change `Migration.dependencies[]` and rename the file if you get migration from my repo. 