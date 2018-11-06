#!/bin/bash

cd $(dirname "$BASH_SOURCE")

set -ev

# Get latest master
git pull

# Update packages
npm install

# Restart server
sudo systemctl daemon-reload
sudo systemctl restart ludwig

git log -n 1

# Show last modified time
ls -ld .git


# Show status
sleep 1
sudo systemctl status ludwig
