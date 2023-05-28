# cd <root>
# docker build -f ./kubernetes/docker/turnserver/Dockerfile -t deathangel908/pychat-coturn .
# docker push deathangel908/pychat-coturn

FROM alpine:3.17.3
RUN apk update && \
    apk add --no-cache coturn bash

COPY ./kubernetes/docker/turnserver/turnserver.conf /etc/coturn/turnserver.conf
COPY ./kubernetes/docker/turnserver/entrypoint.bash /bin
CMD ["/bin/bash", "/bin/entrypoint.bash"]
