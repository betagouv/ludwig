Ludwig facilite la validation collaborative d'une application.


# Usage

L'usage principal, ou du moins initial de ce produit correspond à l'ajout de fichier de tests à partir de l'API.

`curl -X POST https://ludwig.incubateur.net/api/repositories/github/betagouv/openfisca-paris/suggest -d @data.json -H 'Content-Type: application/json'`
Avec `data.json`:
```json
{
  "title": "Titre de la Pull Request et du commit",
  "body": "Détails de la pull request et du commit",
  "content": "Contenu du fichier ajouté\n"
}
```

# Notes d'installation

## Commandes initiales

Ludwig a été déployé sur une Ubuntu 16.4.

Les commandes suivantes ont été nécessaires :
```shell
sudo apt-get update
sudo apt-get install build-essential git libcurl4-openssl-dev mongodb-server nginx nodejs npm
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
Restart=always
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

## _Continuous_ deployment

```
command="/home/cloud/ludwig/deploy.sh",no-pty,no-port-forwarding,no-agent-forwarding ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDoD3h4KJfjrGmRkYBd3/+gtaQTVautl/W8P258puydWx/ON5gZeyNuYBMzBaix9SfZk5qkY+U6y1PrnqKqjYQLJVU5IVcHkgaBGREQmOCQyfdBvpuXBeAVvmqEodeS32PtjNVC8F32CMwFZxJs0dCpMWyPkX2cLElZrqZdX6n+Ki2BbpHTwcEi2YRM6gmKxMStsYVxjTCpx90B2lnNuByoIb+saz5+g8ivF3XySxLQKJ72g8NC6mg1FZewsTCmvfpPL3gX3+v62CRjRMb68YgCBFAW7aKv/9XtNCr9jo+icpDcpD3js9/qvHKHE0yJEKSj1U2MsHdGP1qivRGf4iGB
```

En cas de changement du service, il faut aussi lancer la commande suivante
```
sudo systemctl daemon-reload
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

## Secrets

Certaines variables doivent rester privées pour protéger les informations des usagers.

Variables d'environnement pour `/opt/ludwig/secrets` :
```
# Secret for signing cookies
SESSION_SECRET=not-so-secret
```

## GitHub integration and environment variables

Il y a plusieurs liens avec GitHub :
- Une [OAuth application](https://developer.github.com/apps/building-oauth-apps/) visible pour les membres de betagouv sur [GitHub](https://github.com/organizations/betagouv/settings/applications/504245)
- Un compte de bot [`ludwig-bot`](https://github.com/ludwig-bot) pour créer des PRs sans compte sur GitHub et
- Un compte de test [`ludwig-test`](https://github.com/ludwig-test) pour `git push` sur GitHub.

### OAuth application

Variables d'environnement pour `/opt/ludwig/secrets` :
```
GITHUB_APP_CLIENT_ID=b5a749648fca58d886ec
GITHUB_APP_CLIENT_SECRET=yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy
GITHUB_APP_REDIRECT_URI=https://ludwig.incubateur.net/oauth/github/callback
GITHUB_APP_USER_AGENT=Ludwig-504245

# Default committer and pull requester - personal token - ludwig-bot
GITHUB_LUDWIG_USER_TOKEN=zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz

# Beta pusher - personal token - ludwig-test
GITHUB_PUSH_TOKEN=uuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuu
```

`GITHUB_APP_CLIENT_ID`, `GITHUB_APP_CLIENT_SECRET` et `GITHUB_APP_REDIRECT_URI` sont disponibles sur [la page de l'application](https://github.com/organizations/betagouv/settings/applications/504245).
`GITHUB_APP_USER_AGENT` est [demandé par GitHub](https://developer.github.com/v3/#user-agent-required) pour faciliter l'identification des utilisateurs de son API.

Les `personal token`s de compte GitHub sont générés via [la page suivante](https://github.com/settings/tokens).
