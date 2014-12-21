#!/bin/sh
#this file is used to start the project

#sudo systemctl start mysqld &&  # systemctl is default systemd manager. Change it to yours, or start the demon manually.
redis-server &
sleep 1 && node ./node_modules/ishout.js/server.js #&  # change path to your server.js from ishout's path
#sleep 1 && python manage.py runserver