#!/bin/bash

sed -i "s|MIN_PORT|$MIN_PORT|g" /etc/coturn/turnserver.conf && \
sed -i "s|MAX_PORT|$MAX_PORT|g" /etc/coturn/turnserver.conf && \
sed -i "s|DOMAIN_NAME|$DOMAIN_NAME|g" /etc/coturn/turnserver.conf && \
sed -i "s|USERNAME|$USERNAME|g" /etc/coturn/turnserver.conf && \
sed -i "s|PASSWORD|$PASSWORD|g" /etc/coturn/turnserver.conf && \
/usr/bin/turnserver
