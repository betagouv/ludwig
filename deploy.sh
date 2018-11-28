#!/bin/bash

cd $(dirname "$BASH_SOURCE")

set -ev

# Get latest master
git pull


ls /home/cloud/.ssh
cat /home/cloud/.ssh/authorized_keys
