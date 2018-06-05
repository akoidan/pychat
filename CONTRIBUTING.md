draw-io
=======
Webrtc frontend classes diagram you can find [here](https://www.draw.io/?lightbox=1&highlight=0000ff&edit=_blank&layers=1&nav=1&title=draw.io-uml_diagram.xml#Uhttps%3A%2F%2Fraw.githubusercontent.com%2FDeathangel908%2Fpychat%2Fmaster%2Fdraw.io-uml_diagram.xml).

download_content.sh
===================
Execute `bash download_content.sh` it will show you help.


Frontend logging
=================
By default each user has turned off browser (console) logs. You can turn them on in [/#/profile](https://localhost:8000/#/profile) page (`logs` checkbox). All logs are logged with `window.logger` object, for ex: `window.logger('message')()`. Note that logger returns a function which is binded to params, that kind of binding shows corrent lines in browser, especially it's handy when all source comes w/o libraries/webpack or other things that transpiles or overhead it. You can also inspect ws messages [here](ws_messages.jpeg) for chromium. You can play with `window.wsHandler.handleMessage(object)` and `window.wsHandler.handle(string)` methods in debug with messages from log to see what's going on

Smileys
=======
By default pychat uses standard  [commfort](http://www.commfort.com/en/) chat  [smileys](DefaultSmilies.cfpack) . `python manage.py extract_cfpack.py` extracts files from this pack and generates [info.json](chat/static/smileys/info.json), if you want to add/delete smileys - just edit `info.json`

Icons
=====
Chat uses [fontello](fontello.com) and its api for icons. You can easily edit fonts via your browser, just execute `bash download_content.sh fonts_session`. Make your changes and hit "Save session". Then execute `sh download_content.sh download_fontello`. If you did everything right new icons should appear in [demo.html](https://127.0.0.1:8000/static/demo.html)

Sustaining online protocol
=============
Server pings clients every PING_INTERVAL miliseconds. If client doesn't respond with pong in PING_CLOSE_JS_DELAY, server closes the connection. If ther're multiple tornado processes if can specify port for main process with MAIN_TORNADO_PROCESS_PORT. In turn the client expects to be pinged by the server, if client doesn't receive ping event it will close the connection as well. As well page has window listens for focus and sends ping event when it receives it, this is handy for situation when pc suspends from ram.


Database migrations
===================
Pychat uses standard [django migrations](https://docs.djangoproject.com/en/1.11/topics/migrations/) tools. So if you updated your branch from my repository and database has changed you need to `./manage.py makemigration` and  `./manage.py migrate`. If automatic migration didn't work I also store migrations in [migration](migrations).  So you might take a look if required migration is there before executing commands. If you found required migration in my repo don't forget to change `Migration.dependencies[]` and rename the file.

Screen Share
============
ScreenShare is only available for chrome atm. It uses `chrome.desktopCapture` feature that is available only via extension. The extension folder is located under [screen_cast_extension](screen_cast_extension)`.
If you want to locally test it:

 - Open `chrome://extensions/` url in chrome and verify that `developer mode` checkbox is checked.
 - In the same tab click on `load unpacked extension...` button and select [screen_cast_extension](screen_cast_extension) directory.
 - Note that in order to `background.js` be able to receive messages from webpage you need to add your host to `externally_connectable` section in  [manifest.json](screen_cast_extension/manifest.json)

Tp publish extension:
 - If you want to update existing extension don't forget to increment `version` in [manifest.json](package/manifest.json).
 - Zip [screen_cast_extension](screen_cast_extension) directory into e.g. `bash download_content.sh zip_extension`
 - Upload archive `extension.zip` to [chrome webstore](https://chrome.google.com/webstore/developer/dashboard) (Note, you need to have a developer account, that's 5$ worth atm).

WEB Rtc connection establishment
===============================
The successful connection produces logs below in console

Sender:
```
rsok33GN CallHandler initialized
rsok33GN:0005:EJAd Created CallSenderPeerConnection
rsok33GN:0005:EJAd Creating RTCPeerConnection
rsok33GN:0005:EJAd Creating offer...
rsok33GN:0005:EJAd Created offer, setting local description
rsok33GN:0005:EJAd Sending offer to remote
rsok33GN:0005:EJAd onsendRtcData
rsok33GN:0005:EJAd answer received
rsok33GN:0005:EJAd onaddstream
rsok33GN:0005:EJAd onsendRtcData
```

Receiver:
```
rsok33GN CallHandler initialized
rsok33GN:0004:oIc5 Created CallReceiverPeerConnection
rsok33GN:0004:oIc5 Creating RTCPeerConnection
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
