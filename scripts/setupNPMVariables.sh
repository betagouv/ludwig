#!/bin/bash

echo "Github API ClientID? (result from https://github.com/settings/applications/new)"
read clientID
npm config set ludwig:clientID "$clientID"

echo "Github API ClientSecret? (result from https://github.com/settings/applications/new)"
read clientSecret
npm config set ludwig:clientSecret "$clientSecret"

echo "Application session secret? (arbitrary, used for session authentication)"
read sessionSecret
npm config set ludwig:sessionSecret "$sessionSecret"

echo "CORS Allow-Origin? (list all domains that will use this instance)"
read cors
npm config set ludwig:AccessControlAllowOrigin "$cors"

echo "Committer API access token? (result from https://help.github.com/articles/creating-an-access-token-for-command-line-use/)"
read accessToken
npm config set ludwig:accessToken "$accessToken"

echo "Port for the server to listen to"
read port
npm config set ludwig:port "$port"
