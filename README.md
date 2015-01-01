Very simple chat written in django with drealtime, visit http://193.105.201.235
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
4. Database server 
 1. Chat uses SQLite by default. # change DATABASES in Chat/settings.py to use another one
 1. Run `./syncdb.sh` to create database
5. Download static content and IShout.js
 1. `sh download_content.sh` 
 2. if it fails download the resources manually from link specified in it
5. Start the chat 
 1. `redis-server` 
 2. ArchLinux `node ./node_modules/ishout.js/server.js` Ubuntu `nodejs ./node_modules/ishout.js/server.js` # npm's ishout.js directory
 3. `python manage.py runserver 0.0.0.0:80000`

#TODO  
no selectable navbar add chat rooms, implement smiles, Add all users to right panel in the current room. Add languages for menu. 
Remove applying widgets by 1 for fields in forms.py. Remove bootsrap glyphicons. Gradient text disappear on top
 
