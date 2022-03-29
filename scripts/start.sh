#!/bin/sh

shx rm -rf ./.data
# sudo docker system prune -a -f --volumes
docker-compose pull
docker-compose up