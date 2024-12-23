#!/bin/bash

sed -i "s|DOMAIN_NAME|$DOMAIN_NAME|g" /etc/postfix/main.cf && \
/usr/bin/newaliases && \
/usr/sbin/postfix start-fg
