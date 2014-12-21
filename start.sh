#!/bin/sh
#this file is used to start the project

sudo systemctl start mysqld &&# systemctl is default systemd manager. Change it to yours, or start the demon manually.
redis-server &
sleep 1 &&
node ./node_modules/ishout.js/server.js &
sleep 1 && # change path to your server.js from ishout's path
python manage.py runserver