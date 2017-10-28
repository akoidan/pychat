Table of contents
=================
  * [Draw-io uml diagramm](#draw-io)
  * [Djangochat-config submodule](#djangochat-config)
  * [Frontend logging](#frontend-logging)
  * [Smileys](#smileys)
  * [Icons](#icons)
  * [Database migrations](#database-migrations)
  * [Jetbrains filewatcher](#jetbrains-filewatcher)

draw-io
=======
Webrtc frontend classes diagram you can find [here](https://www.draw.io/?lightbox=1&highlight=0000ff&edit=_blank&layers=1&nav=1&title=draw.io-uml_diagram.xml#Uhttps%3A%2F%2Fraw.githubusercontent.com%2FDeathangel908%2Fdjangochat-config%2Fmaster%2Fdraw.io-uml_diagram.xml).

djangochat-config
=================
All self-writted code (text) is stored in [djangochat](/README.md) repository. While all binary files, generated codes, diagrams, fontello icons, even base64 sass is stored in a [separate repository](https://github.com/Deathangel908/djangochat-config) that is named as djangochat-config. Current repository has it as sumbodule. You can clone it with `git submodule update --init djangochat-config`. `djangochat` always refers to specific commit of `djangochat-config` which you can view with `git ls-tree HEAD djangochat-config`. So if you changed something in `djangochat-config` and you want it to appear in `djangochat` repository you need to commit and **push** in `./djangochat-config` submodule, add submodule change with `git commit -m "message" ./djangochat-config` and then execute [download_content.sh](download_content.sh). If you view this script it has `declare -a files=(\` which are gonna be downloaded to `djangochat` repository. Also on the top of the [script](download_content.sh) there're variables: `CONF_REPOSITORY` which you can point to your djangochat-config directory,  and `CONF_VERSION` which you can point to specific commit of django-chat-config. So if you don't want to push changes from `djangochat-config` to remote and have them in `djangochat` repository you can change `CONF_REPOSITORY` to eg `"./djangochat-config"` and `CONF_VERSION` to commit in `djangochat-config` repo, e.g. `HEAD`. Also if you want to build just css files you can use `download_content.sh sass`.  The whole idea of having a separate repository is a bit messy, but I'm gonna stick with it to keep `djangochat` repository as light as possible until I stop experimenting with heavy files that used and removed over and over again.


Frontend logging
=================
By default each user has turned off browser (console) logs. You can turn them on in [/#/profile](https://localhost:8000/#/profile) page (`logs` checkbox). All logs are logged with `window.logger` object, for ex: `window.logger('message')()`. Note that logger returns a function which is binded to params, that kind of binding shows corrent lines in browser, especially it's handy when all source comes w/o libraries/webpack or other things that transpiles or overhead it. You can also inspect ws messages [here](https://github.com/Deathangel908/djangochat-config/blob/master/ws_messages.jpeg?raw=true) for chromium. You can play with `window.wsHandler.handleMessage(object)` and `window.wsHandler.handle(string)` methods in debug with messages from log to see what's going on

Smileys
=======
All scripts to extract smiles located in [djangochat-config](https://github.com/Deathangel908/djangochat-config) in [smileys](https://github.com/Deathangel908/djangochat-config/tree/master/smileys) directory. By default chat uses smileys extracted from  [DefaultSmileys.cpack](https://github.com/Deathangel908/djangochat-config/blob/master/smileys/DefaultSmilies.cfpack) [commfort](http://www.commfort.com/en/) chat.
You can take a look at scripts located there to understand what's going on. If you just want to add an icon/gif you already have - just add it's base64 value to [smileys_data.js](https://github.com/Deathangel908/djangochat-config/blob/master/static/js/smileys_data.js) and follow [djangochat-config](#djangochat-config) section instructions to apply change to main repo.

Icons
=====
To add a new icon you need to drag [djangochat-config/config.json](https://github.com/Deathangel908/djangochat-config/blob/master/config.json) into [fontello](http://fontello.com), click on new icon and on download webfont button. The archive with all icons will be downloaded. Run [./generate-fonts.sh](https://github.com/Deathangel908/djangochat-config/blob/master/generate-fonts.sh) `/path/to/downloaded/acrhive/fontello-uniqueid.zip` to unpack archive into djangochat-config. (You also can manually extract archive: file `config.json` should be unpacked into `/djangochat-config`, `css` `font` `demo.html` files should be unpacked into `/djangochat-config/static`).  If you all did correctly `git status` should show that files were modified but not added. Commit changes and follow [djangochat-config](#djangochat-config) section instructions to apply changed from submodule to main repository. If you all did right [demo.html](https://127.0.0.1:8000/static/demo.html) should show new icons

Database migrations
===================
I use standard [django migrations](https://docs.djangoproject.com/en/1.11/topics/migrations/) tools. So if you updated you branch from my repository and database has changed you need to `./manage.py makemigration` and  `./manage.py migrate`. If automatic migration didn't work I also store migrations in [djangochat-config/migration](https://github.com/Deathangel908/djangochat-config/tree/master/migrations).  So you might take a look if required migration is there before exeuting commands. Don't forget to change `Migration.dependencies[]` and rename the file if you get migration from my repo.
 
Jetbrains filewatcher:
=====================
 1. arguments: `--no-cache --update $FilePath$:$ProjectFileDir$/chat/static/css/$FileNameWithoutExtension$.css --style expanded`
 2. working directory: `$ProjectFileDir$/chat/static/sass`
 3. output files to refresh: `$ProjectFileDir$/chat/static/css/`