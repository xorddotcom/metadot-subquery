#!/bin/sh

shx rm -rf ./.data
docker system prune -a -f --volumes
docker-compose pull
docker-compose up