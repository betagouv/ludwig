Ludwig facilite la validation collaborative d'une application.


# Notes d'installation

## Commandes initiales

Ludwig a été déployé sur une Ubuntu 16.4.

Les commandes suivantes ont été nécessaires :
```shell
sudo apt-get update
sudo apt-get install build-essential git libcurl4-openssl-dev nginx nodejs npm
sudo ln -s /usr/bin/nodejs /usr/local/bin/node
git clone https://github.com/sgmap/ludwig.git
cd ludwig/
git checkout custom_yaml
npm install
npm run start
```

## NGINX

NGINX configuration, pour `/etc/nginx/sites-enabled/ludwig.conf` :
```
server {
  listen              *:80 default_server;
  server_name         ludwig.incubateur.net;

  access_log          /var/log/nginx/ludwig.access.log combined;
  error_log           /var/log/nginx/ludwig.error.log;



  gzip                on;
  gzip_proxied        any;
  gzip_types          application/json
                      application/javascript
                      text/css
                      text/plain
                      text/xml;
  gzip_vary           on;

  location / {
    proxy_pass        http://localhost:4000;
    proxy_redirect    off;
  }
}
```

```
sudo rm /etc/nginx/sites-enabled/default
sudo service nginx restart
```

## Service

Systemd service, pour `/lib/systemd/system/ludwig.service` :
```
[Unit]
Description=Service in charge of ludwig main webserver

[Service]
User=root
Group=root
WorkingDirectory=/home/cloud/ludwig
EnvironmentFile=/opt/ludwig/secrets
ExecStart=/usr/bin/nodejs server

[Install]
WantedBy=multi-user.target
```

```
sudo systemctl daemon-reload
sudo service ludwig start
sudo service ludwig status
sudo systemctl enable ludwig
```

## CI

```
ssh cloud@84.39.45.155 'cd ludwig && git fetch && git pull && npm install && sudo systemctl restart ludwig && git log -n 1 && ls -ld .git'
```

## HTTPS

Instructions récupérées à https://certbot.eff.org/#ubuntuxenial-nginx

```
sudo apt-get update
sudo apt-get install software-properties-common
sudo add-apt-repository ppa:certbot/certbot
sudo apt-get update
sudo apt-get install python-certbot-nginx
```

Puis il faut suivre les instructions de la commande suivante.
```
sudo certbot --nginx
```

## GitHub integration and environment variables

Il y a plusieurs liens avec GitHub :
- Une [OAuth application](https://developer.github.com/apps/building-oauth-apps/) visible pour les membres de betagouv sur [GitHub](https://github.com/organizations/betagouv/settings/applications/504245)
- Un compte de bot [`ludwig-bot`](https://github.com/ludwig-bot) pour créer des PRs sans compte sur GitHub et
- Un compte de test [`ludwig-test`](https://github.com/ludwig-test) pour `git push` sur GitHub.

### OAuth application

Variables d'environnement pour `/opt/ludwig/secrets` :
```
GITHUB_APP_CLIENT_ID=xxxxxxxxxxxxxxxxxxxx
GITHUB_APP_CLIENT_SECRET=yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy

# Default committer and pull requester - personal token - ludwig-bot
GITHUB_LUDWIG_USER_TOKEN=zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz

# Beta pusher - personal token - ludwig-test
GITHUB_PUSH_TOKEN=uuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuu
```

`GITHUB_APP_CLIENT_ID` et `` sont disponibles sur [la page de l'application](https://github.com/organizations/betagouv/settings/applications/504245).

Les `personal token`s de compte GitHub sont générés via [la page suivante](https://github.com/settings/tokens).
