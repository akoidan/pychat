Very simple chat written in django with drealtime
==========
To run this you need:

1. Python3 or Python2
2. pip packages # `pip install packagename` # check http://www.saltycrane.com/blog/2010/02/how-install-pip-ubuntu/ 
 1. django
 2. django-realtime # via pip, or `git pull https://github.com/anishmenon/django-realtime && python setup.py install`
 3. simplejson
 4. PyMySQL and mysql-connector-pytho # if you're using MySQL, the last one to migrate
3. Linux packages
 1. redis-server # `pacman -S community/redis` `add-apt-repository -y ppa:rwky/redis`
 2. nodejs and npm# `pacman -S community/nodejs` `apt-get install nodejs` `apt-get install -y redis-server` `apt-get install npm`
 3. ishout.js # `sudo ln -sf /usr/bin/python2 /usr/bin/python``sudo npm install ishout.js`
4. Database server # Chat uses SQLite by default. Check DATABASES in Chat/settings.py 
 1. Using MySQL: Create db `mysql -u root` `CREATE DATABASE 'django'; exit;` `mysql -u root < ./mysqldumb.sql`
 2. Using SQLite `syncdb.sh`
3. Start the chat 
 1. `redis-server` 
 2. `node ./node_modules/ishout.js/server.js || nodejs ./node_modules/ishout.js/server.js` # npm's ishout.js directory
 3. `python manage.py runserver`
