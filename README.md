# Qu'est-ce que c'est ?

Ludwig outille la proposition de corrections d'une application web par des utilisateurs et des experts métier.

## Pour les contributeurs

Ludwig minimise le temps passé à proposer des corrections sur une fonctionnalité et facilite le dialogue avec les développeurs.

## Pour les développeurs

On s'appuie sur Github et ses APIs pour minimiser les outils. Ludwig simplifie la gestion des suggestions en s'appuyant sur les _pull requests_.


# Installation

## Pré-requis

Pour installer Ludwig et le lancer, vous aurez besoin de :

* [nodejs/npm](https://nodejs.org)
* [bower](http://bower.io)
* [webpack](http://webpack.github.io)

## Utiliser le widget dans une application

Ludwig se découpe en deux composants :

* le widget navigateur ;
* le webservice.

Le widget peut s'utiliser seul pour certaines fonctionnalités, mais prend surtout son intérêt couplé au webservice.

### Configurer le widget

Le widget s'instancie avec en unique paramètre un objet contient les informations nécessaires pour joindre le dépôt Gihub de votre projet. Il faut donc s'occuper de cette configuration avant de déployer le widget.
Le plus simple est de se baser sur le fichier `ludwig-conf.js` (le server et le widget partagent le même fichier de configuration), puis d'exécuter `webpack` à la racine du répertoire de l'application. Un fichier `bundle.js` est généré. Il contient le widget.

_Note :_ Cette configuration est packagée avec le widget à distribuer, il est inutile de la charger à part.

#### Détail des entrées du fichier de configuration du widget

* `repoUrl` : l'URL Github principale du dépôt de l'application
* `template` : Un template (URLencoded) à utiliser pour remplir le fichier créé avec la suggestion
* `prefix` : préfixe du fichier qui sera créé lors de la suggestion
* `acceptedTestsPath` : l'URL où l'on peut consulter les tests acceptés par l'équipe
* `addPath` : suffixe d'URL accolé à repo_url pour ajouter une nouvelle demande
* `suggestedTestsPath` : L'URL qui présente les suggestions non validées

_Note :_ Le fichier `ludwig-sample.js` se trouve à la racine du projet.

### Ajouter le widget

L'application peut embarquer le widget directement ou se le faire servir par le backend Ludwig. Dans le premier cas, il faut que l'application embarque le fichier `bundle.js` généré dans l'étape précédente. Dans le second cas on va retrouver ce fichier à `$URL_DE_L_APPLI/bundle.js`.

```html
<script type="text/javascript" src="http://url.ludwig/bundle.js" charset="utf-8">
```

Une fois cet ajout fait, le widget est disponible sous le nom `Ludwig` (qui est une classe, pour accéder aux fonctionnalités, il faut donc l'instancier en passant par un `new Ludwig(configuration)`, avec `configuration` un objet contenant la configuration du widget se basant sur l'exemple fourni par `ludwig-sample.js`)

### L'API du widget
Le widget embarque sa propre configuration pour les diverses URLs à appeler pour une tâche ou l'autre. Rien à faire de ce côté ci donc. 

Aujourd'hui, le widget met à disposition plusieurs fonctions :

* generateSuggestionURL(currentState, expectedResult [, customSuggestionFormatter] ) : Génère une URL permettant d'ajouter un fichier correspondant à une suggestion. L'état collecté par l'application ainsi que le résultat attendu seront sérialisés dans la requête. 
Il est possible de préciser à la méthode une fonction personnalisée pour sérialiser le template, l'état et le résultat attendu. Cette fonction doit prendre 3 paramètres et renvoyer une chaîne de caractères (qui sera ensuite échappée par Ludwig)
* generateSuggestionName() : Génère un nom de suggestion qui se base sur le préfixe configuré et la date courante.
* acceptedTestsURL() : Génère l'URL permettant d'accéder à la liste des tests acceptés.
* suggestedTestsURL() : Génère l'URL permettant de consulter les suggestions de tests.
* generateLudwigSuggestionEndpointURL(suggestionTitle, suggestionDescription, currentState, expectedResult) : Crée le lien qui permet de contacter l'API Ludwig pour créer une nouvelle suggestion. Cela permet de fournir un titre et une description en plus de l'état et du résultat attendu. 

## Configurer et lancer l'API

### Configurer

Le fichier de configuration utilisé par l'API se trouve à la racine. Il permet de configurer les endpoints de l'API Github à utiliser, mais surtout les clefs API pour le repository de l'application qui va utiliser Ludwig.

_Note :_ Un fichier `ludwig-sample.js` se trouve à la racine du projet.

### Lancer

C'est une application NodeJS qui ne demande rien de particulier. Une fois ses dépendances installées, Ludwig peut ensuite être démarré comme bon vous semble :

**Attention**, il faut avoir créé les **fichiers de configuration du widget et de l'API avant** de dérouler ces étapes.

```
user@host$ npm install # installer / packager
user@host$ npm start
user@host$ node server.js
user@host$ pm2 start pm2.conf.json
```

## Notes sur la configuration

En l'état, vous devez créer les fichiers de configuration du widget et de l'API, ils ne sont volontairement pas directement fournis pour que le packaging du widget échoue s'il est fait avant que la configuration ait été écrite. De même, le serveur d'API refusera de démarrer sans sa configuration.

Les fichiers `sample` sont là pour qu'il ne reste plus qu'à remplir les blancs et renommer les fichiers pour avoir une configuration qui permette de packager / démarrer.

## Tester l'API

Il existe aujourd'hui une page qui permet de directement tester l'API dans un navigateur, elle est exposée dans `/test`.
