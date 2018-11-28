#!/bin/bash

cd $(dirname "$BASH_SOURCE")

set -ev

# Get latest master
git pull

# Ensure SSH keys are appropriately set
AUTHORIZED_KEYS_FILE=/home/cloud/.ssh/authorized_keys
echo 'command="/home/cloud/ludwig/deploy.sh",no-pty,no-port-forwarding,no-agent-forwarding ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDoD3h4KJfjrGmRkYBd3/+gtaQTVautl/W8P258puydWx/ON5gZeyNuYBMzBaix9SfZk5qkY+U6y1PrnqKqjYQLJVU5IVcHkgaBGREQmOCQyfdBvpuXBeAVvmqEodeS32PtjNVC8F32CMwFZxJs0dCpMWyPkX2cLElZrqZdX6n+Ki2BbpHTwcEi2YRM6gmKxMStsYVxjTCpx90B2lnNuByoIb+saz5+g8ivF3XySxLQKJ72g8NC6mg1FZewsTCmvfpPL3gX3+v62CRjRMb68YgCBFAW7aKv/9XtNCr9jo+icpDcpD3js9/qvHKHE0yJEKSj1U2MsHdGP1qivRGf4iGB CircleCI' > $AUTHORIZED_KEYS_FILE
curl --silent https://github.com/guillett.keys >> $AUTHORIZED_KEYS_FILE

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
