#!/bin/sh
if [[ -z "$1" ]] ; then
 echo "pass migration name"
 exit;
fi
python manage.py schemamigration story $1 --initial
python manage.py syncdb --all 
python manage.py migrate --fake 