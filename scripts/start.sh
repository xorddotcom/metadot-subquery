#!/bin/sh

shx rm -rf ./.data
docker-compose pull
docker-compose up