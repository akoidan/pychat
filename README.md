Very simple chat written in django with drealtime
==========
To run this you need:
python2 or python3

pip packages:
django-realtime #
PyMySQL # SQLite
simplejson

redis-server # pacman -S community/redis 
nodejs # pacman -S community/nodejs  
ishout.js # wget https://inzane@bitbucket.org/inzane/ishout/get/77c5c2b0e615.zip ;echo 'https://www.npmjs.org/package/ishout.js'

database # chat uses mysql by default, you if consider to use another one - change DATABASES in Chat/settings.py  and use syncdb.sh to create appropriate DB ( previously configured with django)
