Very simple chat written in django with drealtime
==========
To run this you need:

1. Python3 or Python2
2. pip packages # `pip install packagename`
 1. django
 2. django-realtime #if pip2 doesn't have it - install https://github.com/anishmenon/django-realtime
 3. simplejson
 4. PyMySQL # or SQLite or w/e
 5. mysql-connector-python # mysql backend for DB migrate

3. linux packages
 1. redis-server # `pacman -S community/redis` http://tosbourn.com/install-latest-version-redis-ubuntu/  http://redis.io/
 2. nodejs # `pacman -S community/nodejs`  http://nodejs.org/
 3. ishout.js #`npm install ishout.js` https://www.npmjs.com/package/ishout.js
4. Database server # Chat uses mysql by default. If you consider to use another one - change DATABASES in Chat/settings.py  and use syncdb.sh to create DB
 1. Using mysql
  1. Install mysql server. I use mariadb # `pacman -S mariadb`
  2. Create database using `syncdb.sh init` or `mysqldumb.sql`
 2. Using SQLite
  1. Use `syncdb.sh init`
3. run `start.sh`
