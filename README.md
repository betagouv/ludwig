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

``
sudo rm /etc/nginx/sites-enabled/default
sudo service nginx restart
``

## Service

Systemd service, pour `/lib/systemd/system/ludwig.service` :
```
[Unit]
Description=Service in charge of lduwig main webserver

[Service]
User=root
Group=root
WorkingDirectory=/home/cloud/ludwig
ExecStart=/usr/bin/nodejs server/app.js

[Install]
WantedBy=multi-user.target
```


```
sudo systemctl daemon-reload
sudo service ludwig start
sudo service ludwig status
sudo systemctl enable ludwig
```
