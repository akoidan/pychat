# cd <root>
# docker build -f ./kubernetes/docker/postfix/Dockerfile -t deathangel908/pychat-postfix .
# docker push deathangel908/pychat-postfix

FROM alpine:3.17.3
RUN apk update && \
    apk add --no-cache postfix policyd-spf-fs bash

COPY ./kubernetes/docker/postfix/entrypoint.bash /bin
COPY ./kubernetes/docker/postfix/main.cf /etc/postfix/main.cf
COPY ./kubernetes/docker/postfix/master.cf /etc/postfix/master.cf

CMD ["/bin/bash", "/bin/entrypoint.bash"]
