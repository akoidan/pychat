#!/bin/sh
#this file is used to start the project

sudo systemctl start mysqld # systemctl is default systemd manager. Change it to yours, or start the demon manually.
redis-server & node ./node_modules/ishout.js/server.js 

