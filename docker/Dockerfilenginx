FROM alpine:3.7
RUN set -x &&\
apk update &&\
apk add nginx
COPY ./rootfs/etc/nginx/ssl/certificate.crt ./rootfs/etc/nginx/ssl/server.key /etc/nginx/ssl/
COPY ./docker/nginx.conf /etc/nginx
CMD ["nginx", "-g", "pid /tmp/nginx.pid; daemon off;"]