Very simple chat written in django with drealtime
==========
To run this you need:

1. Python3 or Python2, both are supported
2. pip packages # `pip install packagename` # python-pip 
 1. django
 2. django-realtime # via pip, or `git clone https://github.com/anishmenon/django-realtime && cd django-realtime && python setup.py install`
 3. simplejson
 4. PyMySQL and mysql-connector-python # only if you're using MySQL, the last one to migrate
3. Linux packages
 1. redis-server # ArchLinux `pacman -S community/redis`, Ubuntu `add-apt-repository -y ppa:rwky/redis` `apt-get install -y redis-server`
 2. nodejs and npm# ArchLinux `pacman -S community/nodejs` Ubuntu `apt-get install nodejs` `apt-get install npm`
 3. ishout.js # use python2 to install if 3rd fails `ln -sf $(which python2) $(which python)` `npm install ishout.js` switch it back if necessary
4. Database server # Chat uses SQLite by default. Check DATABASES in Chat/settings.py 
 1. Using MySQL: Create db `mysql -u root` `CREATE DATABASE 'django'; exit;` `mysql -u root < ./mysqldumb.sql`
 2. Using SQLite `./syncdb.sh`
3. Start the chat 
 1. `redis-server` 
 2. ArchLinux `node ./node_modules/ishout.js/server.js` Ubuntu `nodejs ./node_modules/ishout.js/server.js` # npm's ishout.js directory
 3. `python manage.py runserver`

#TODO  user profile, no selectable navbar add chat rooms, implement smiles and special characters such as <b> etc 
change scroll bar of chatbox