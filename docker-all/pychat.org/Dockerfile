FROM deathangel908/pychat
COPY ./docker-all/pychat.org/certificate.crt ./docker-all/pychat.org/server.key /etc/nginx/ssl/
COPY ./docker-all/pychat.org/settings.py /srv/http/chat/
COPY ./docker-all/pychat.org/production.json /srv/http/fe/
RUN chown http:http /srv/http/chat/settings.py
RUN chown http:http /srv/http/fe/production.json



