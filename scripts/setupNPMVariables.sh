#!/bin/bash

echo "Github API ClientID?"
read clientID
npm config set ludwig:clientID "$clientID"

echo "Github API ClientSecret?"
read clientSecret
npm config set ludwig:clientSecret "$clientSecret"

echo "Application session secret?"
read sessionSecret
npm config set ludwig:sessionSecret "$sessionSecret"

echo "CORS Allow-Origin?"
read cors
npm config set ludwig:AccessControlAllowOrigin "$cors"

echo "Authorized user API access token"
read accessToken
npm config set ludwig:accessToken "$accessToken"

echo "Port for the server to listen to"
read port
npm config set ludwig:port "$port"