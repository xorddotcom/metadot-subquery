#!/usr/bin/env bash

echo "removing everything..."

sudo rm -rf .data dist node_modules src/types .yarn/cache .yarn/install-state.gz
sudo docker system prune -a -f --volumes

echo "done!"
