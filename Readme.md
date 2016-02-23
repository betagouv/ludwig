# Qu'est-ce que c'est?

## Pour les utilisateurs
L'objectif de Ludwig est de minimiser le temps passé à saisir un nouveau cas / une fonctionnalité que l'on pense améliorable, à l'équipe qui développe l'application qui intègre Ludwig.

## Pour les dévelopeurs
Ici, on s'appuie sur Github (et peut être d'autres services à l'avenir) et ses APIs pour minimiser les outils à déployer pour faire de la gestion de tickets. Ludwig tente aussi de simplifier la gestion de certaines demandes en s'appuyant sur le mécanisme de pull requests.

# Installation

## Pré-requis

Pour installer Ludwig et le lancer, vous aurez besoin de :

* nodejs/npm
* bower
* webpack

## Utiliser le widget dans une application

Ludwig se découpe en deux composants :

* Le widget navigateur
* Le webservice

Le widget peut s'utiliser seul pour certaines fonctionnalités, mais prend surtout son intérêt couplé au webservice.

### Configurer le widget

Le widget s'appuie sur un fichier de configuration qui contient les informations nécessaires pour joindre le dépôt Gihub de votre projet. Il faut donc s'occuper de cette configuration avant de déployer le widget.
Le plus simple est de renseigner le fichier "ludwig-widget-conf.js", puis d'exécuter "webpack" à la racine du répertoire de l'application. Un fichier "bundle.js" est généré. Il contient le widget.

Note : Cette configuration est packagée avec le widget à distribuer, il est inutile de la charger à part.

#### Détail des entrées du fichier de configuration du widget

* repo_url : l'URL Github principale du dépôt de l'application
* template : Un template (URLencoded) à utiliser pour remplir le fichier créé avec la suggestion
* prefix : préfixe du fichier qui sera créé lors de la suggestion
* accepted_tests_path : l'URL où l'on peut consulter les tests acceptés par l'équipe
* add_path : suffixe d'URL accolé à repo_url pour ajouter une nouvelle demande
* suggested_tests_path : L'URL qui présente les suggestions non validées

Note : Un fichier ludwig-widget-sample.js se trouve à la racine du projet

### Ajouter le widget

L'application peut embarquer le widget directement ou se le faire servir par le backend Ludwig. Dans le premier cas, il faut que l'application embarque le fichier bunble.js généré dans l'étape précédente. Dans le second cas on va retrouver ce fichier à _URL_DE_L_APPLI_/bundle.js .

    <script type="text/javascript" src="http://url.ludwig/bundle.js" charset="utf-8">

## Configurer / lancer L'API

### Configurer

Le fichier de configuration utilisé par l'API se trouve à la racine, il permet de configurer les endpoints de l'API github à utiliser (par exemple), mais surtout les clefs API pour le repository de l'application qui va utiliser Ludwig.

Note : Un fichier ludwig-widget-sample.js se trouve à la racine du projet

### Lancer

C'est une application NodeJS qui ne demande rien de particulier. Une fois ses dépendances installées, Ludwig peut ensuite être démarré comme bon vous semble :

**Attention**, il faut avoir créé les **fichiers de configuration du widget et de l'API avant** de dérouler ces étapes.

    user@host$ npm i #installer / packager
    user@host$ npm start
    user@host$ node server.js
    user@host$ pm2 start pm2.conf.json

## Notes sur la configuration

En l'état, vous devez créer les fichiers de configuration du widget et de l'API, ils ne sont volontairement pas directement fournis pour que le packaging du widget échoue s'il est fait avant que la configuration ait été écrite. De même, le serveur d'API refusera de démarrer sans sa configuration.

Les fichiers "sample" sont là pour qu'il ne reste plus qu'à remplir les blancs et renommer les fichiers pour avoir une configuration qui permette de packager / démarrer.

## Tester l'API

Il existe aujourd'hui une page qui permet de directement tester l'API dans un navigateur, elle est exposée dans /test