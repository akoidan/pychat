#!/bin/sh

#if [[ -z "$1" ]] ; then
# echo "pass migration name"
# exit;
#fi

#Django 1.6 South
#python manage.py schemamigration story $1 --initial
#python manage.py syncdb --all
#python manage.py migrate --fake

python manage.py makemigrations story
python manage.py migrate story

#MYSQL - CREATE DATABASE `django` /*!40100 DEFAULT CHARACTER SET utf8 */;