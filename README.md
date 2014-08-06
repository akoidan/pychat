Very simple chat written in django with drealtime
==========
To run this you need:

python2 # drealtime has some issues with sockets on py3

redis-server 
node node_modules/ishout.js/server.js
mysqld # use syncdb.sh to create appropriate DB ( previously configured with django)
