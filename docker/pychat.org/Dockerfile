FROM deathangel908/pychat

COPY ./docker/pychat.org/certificate.crt ./docker/pychat.org/server.key ./docker/pychat.org/settings.py ./docker/pychat.org/production.json /data/

RUN su - http -c 'bash /srv/http/download_content.sh compile_js'


