Very simple chat written in django with drealtime
==========
To run this you need:

1. Python3 or Python2
2. pip packages # `pip install packagename`
 1. django
 2. django-realtime #if pip2 doesn't have it - install https://github.com/anishmenon/django-realtime
 3. simplejson
 4. httplib2 #if you're using python3
 4. PyMySQL and mysql-connector-pytho # if you're using MySQL, the last one to migrate

3. linux packages
 1. redis-server # `pacman -S community/redis` http://tosbourn.com/install-latest-version-redis-ubuntu/  http://redis.io/
 2. nodejs # `pacman -S community/nodejs`  http://nodejs.org/
 3. ishout.js # `sudo ln -sf /usr/bin/python2 /usr/bin/python``sudo npm install ishout.js` https://www.npmjs.com/package/ishout.js
 
4. Database server # Chat uses SQLite by default. Check DATABASES in Chat/settings.py 
 1. Using MySQL: Create db `mysql -u root` `CREATE DATABASE 'django'; exit;` `mysql -u root < ./mysqldumb.sql`
 2. Using SQLite `syncdb.sh init`
3. run chat `start.sh`
