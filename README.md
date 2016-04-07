# Qu'est-ce que c'est ?

Ludwig outille la proposition de corrections d'une application web par des utilisateurs et des experts métier.

## Pour les contributeurs

Ludwig minimise le temps passé à proposer des corrections sur une fonctionnalité et facilite le dialogue avec les développeurs.

## Pour les développeurs

On s'appuie sur GitHub et ses APIs pour minimiser les outils. Ludwig simplifie la gestion des suggestions en s'appuyant sur les _pull requests_.

# De quoi est composé Ludwig?

Ludwig comprend deux composants :

* le widget navigateur ;
* l'application.

Le widget peut s'utiliser seul pour certaines fonctionnalités, mais prend surtout son intérêt couplé à l'application.

## Que fait le widget navigateur ?

Le widget est là pour simplifier la collecte d'informations fonctionnelles pour créer des tests pour l'application qui intègre le widget.

## Que fait l'application ?

L'application, quant à elle, permet de faire le lien entre le widget et GitHub (pour certaines fonctionnalités nécessitant une utilisation authentifiée de l'API GitHub, par exemple).
Elle permet aussi d'aggréger les résultats de tests fonctionnels de l'application (au format xUnit) et de les présenter aux utilisateurs.

Exemple de fiche résumée :
![resultats_big_picture](./documentation/big_picture.png)

Exemple de détail pour un test (historique) :
![resultats_single](./documentation/single.png)

# Installation

## Pré-requis

Pour installer Ludwig et le lancer, vous aurez besoin de :

* [NodeJS/NPM](https://nodejs.org)
* [MongoDB](http://www.mongodb.org)

## Utiliser le widget dans une application

### Configurer le widget

Le widget s'instancie avec en unique paramètre un objet contenant les informations nécessaires pour joindre le dépôt GitHub de votre projet.

#### Détail des entrées de la configuration du widget

* `repo` : identifiant du dépôt GitHub de l'application (ex : https://github.com/<strong>sgmap/ludwig</strong>).
* `branch` : branche dans laquelle créer des nouvelles demandes et consulter la liste de tests.
* `template` : contenu par défaut du fichier créé avec la suggestion.
* `prefix` : préfixe du fichier qui sera créé lors de la suggestion.
* `ludwigCreateSuggestionURL` : l'URL Ludwig à joindre pour créer une suggestion en passant par les APIs authentifiées GitHub.

### Ajouter le widget

L'application peut embarquer le widget directement ou se le faire servir par le backend Ludwig. Dans le premier cas, il faut que l'application embarque le fichier `ludwig.js` généré dans l'étape précédente. Dans le second cas on va retrouver ce fichier à `$URL_DE_L_APPLI/ludwig.js`.

```html
<script type="text/javascript" src="http://url.ludwig/ludwig.js" charset="utf-8">
```

Une fois cet ajout fait, le widget est disponible sous le nom `Ludwig` (qui est une classe, pour accéder aux fonctionnalités, il faut donc l'instancier en passant par un `new Ludwig(configuration)`, avec `configuration` un objet contenant la configuration du widget telle que définie plus haut).

_Note : Le widget "prêt à servir" à jour est présent dans le répertoire `dist` du module publié._

### L'API du widget
Le widget doit être initialisé avec sa configuration pour les diverses URLs à appeler pour une tâche ou l'autre. La configuration suit la même organisation que celle côté serveur.

Son API complète est documentée dans [un document à part](./documentation/widgetAPI.md)
On notera cependant 2 fonctions principales:

* `generateSuggestionURL(currentState, expectedResult [, customSuggestionFormatter] )` : Génère une URL permettant d'ajouter un fichier correspondant à une suggestion.
**ATTENTION** : Cette utilisation est limitée par GitHub et par les navigateurs eux-mêmes pour les URLs trop longues. L'API retournera une erreur si la longueur totale de l'URI générée par le widget dépasse une taille compatible avec les navigateurs supportés par Ludwig.
* `generateLudwigSuggestionEndpointURL(suggestionTitle, suggestionDescription, currentState, expectedResult)` : Crée le lien qui permet de contacter l'API Ludwig pour créer une nouvelle suggestion. Cela permet de fournir un titre et une description en plus de l'état et du résultat attendu.

## Configurer et lancer le serveur Ludwig

### Configurer

Le fichier de configuration utilisé par l'application se trouve à la racine. Il permet de configurer l'accès à une base de données mongo (pour stocker les rapports de tests) ainsi que quelques informations sur le dépôt GitHub où sont publiés les fichiers de tests et où l'on va créer des pull requests pour les demandes de nouveaux tests.


#### Détail de la configuration générale de l'application

Un fichier exemple `ludwig-conf-sample.js` est présent à la racine du projet, renommé en `ludwig-conf.js` et édité pour y mettre les informations correspondant à votre dépôt / votre base de données il devrait permettre à votre instance de se lancer et de communiquer avec les APIs GitHub.

* `repository`: Le dépôt GitHub où sont versionnés les tests (sous la forme `<utilisateur>/<nom du dépôt>`
* `acceptedTestsLocation`: Le chemin dans le dép&ot GitHub où trouver le répertoire contenant les tests (ex: `/treee/master/tests` si le répertoire `tests` est à la racine du dépôt et que c'est celui que l'on souhaite utiliser)
* `github`:
    * `branchToCreatePullRequestsFor`: La branche de travail (par défaut : master)
    * `authenticationCallback`: L'URL de callback que GitHub doit appeler lors d'une authentification
* `mongo` (cette section correspond à ce que l'on trouve dans la documentation de [mongoose](http://mongoosejs.com/docs/api.html#index_Mongoose-connect)):
    * `uri`: L'URI de connexion
    * `options`: Les options que l'on souhaite passer à mongoose

#### Configuration des secrets
Afin que votre application puisse utiliser les APIs GitHub (et en particulier connecter le contributeur lorsqu'il tente de soumettre un cas de test) votre instance de Ludwig doit être enregistrée.
Cela se fait par le biais de [cette page](https://github.com/settings/applications/new). Une fois le formulaire présenté rempli et validé, GitHub vous fournira le clientID et le clientSecret dont vous avez besoin.

_Note : Pour correctement renseigner le champ `Authorization callback URL`, il faut fournir une URL de type `<URI de la machine Ludwig>/github_callback`._

La configuration des clefs d'API GitHub se fait par `npm config`. Il faut enregistrer les clefs suivantes :

* `ludwig:clientID` : Client ID à utiliser pour requêter l'API GitHub
* `ludwig:clientSecret` : Client Secret à utiliser pour requêter l'API GitHub
* `ludwig:accessToken` : Un access token de compte ayant le droit de créer des commits sur le dépôt du projet (celui du mainteneur principal par exemple). Un guide est disponible [ici](https://help.github.com/articles/creating-an-access-token-for-command-line-use/).
_Note : Dans le cas qui nous intéresse pour le jeton d'accès, il faut en créer un avec le scope "repo" et ne pas sélectionner les autres._

Les clientID et clientSecret doivent être créés au préalable par le responsable du dépôt qui sera modifié de sorte à permettre à Ludwig d'accéder au dépôt et d'y faire des modifications.

Deux autres paramètres sont configurés par clefs de configuration NPM :

* `ludwig:sessionSecret` : Le secret qui sera utilisé pour signer le cookie de session (et éviter qu'il soit manipulé)
* `ludwig:AccessControlAllowOrigin` : Le pattern d'URLs autorisées pour une utilisation cross-domain (si le widget et l'application Ludwig sont sur des machines avec des domaines différents)

Pour automatiser l'enregistrement de toutes les clefs de configuration npm, un script est disponible dans `./scripts/setupNPMVariables.sh`. Cela reste partiellement manuel mais aucune clef n'est oubliée et cela devrait éviter les fautes de frappe.

### Lancer le serveur Ludwig

**Attention**, il faut avoir créé le **fichier de configuration de l'application**.
Le fichier `ludwg-conf-sample.js` est là pour qu'il ne reste plus qu'à remplir les blancs et le renommer en `ludwig-conf,js` pour avoir une configuration qui permette de démarrer le serveur.

```
$ npm install # installer / packager
$ npm start
```

### Consulter le rapport des derniers tests

#### Description générale
Il est possible d'alimenter une base de données avec des rapports de tests afin de présenter aux contributeurs l'état des tests de l'application et son historique.

Pour pouvoir visualiser ces rapports, il faut tout d'abord alimenter la base de données de l'application. Cela se fait en utilisant l'utilitaire d'alimentation :

```
user@host$ npm run insertTestReportData <fichier.xunit.xml>
```

Pour l'instant Ludwig accepte les rapports au format xUnit avec une suite de tests à la racine. Pour éviter d'insérer deux fois le même rapport, on considère que la propriété "timestamp" de la suite de tests est une clef unique (et l'importeur déclenchera une erreur si l'on tente d'insérer deux rapports avec le même timestamp, ce qui semble être une approche raisonnable pour un unique projet).

#### Où trouver ce rapport ?

Le rapport peut être trouvé à l'adresse suivante : `/listTests`.

#### Comment enregistrer un rapport pour Ludwig ?

Pour l'instant, les rapports que Ludwig est capable de traiter doivent suivre le format xUnit (avec un bloc testsuite juste sous la racine). Quelques consignes pour profiter des fonctionnalités comme le lien direct vers le fichier source d'un test :

Pour déterminer l'URL du fichier source d'un test, Ludwig se base sur :

* L'URL de base du dépôt où se trouvent les tests (dans la configuration c'est la propriété `baseUrl`).
* Le chemin permettant d'atteindre, sur le dépôt, le répertoire contenant les fichiers de test.
* Le nom du fichier de test lié au test à consulter doit être renseigné dans l'attribut `classname` de chacun des cas de test.

Les informations générales (tests ok, en échec, date des tests, temps pris par la campagne de tests…) se trouvent dans les propriétés de la suite de tests.

* `name` : Le nom de la campagne de test
* `time` : Le temps pris par tous les tests
* `timestamp` : L'heure à laquelle la campagne de tests s'est terminée
* `tests` : Le nombre total de tests
* `errors` : Les tests en erreur (cassés, le problème est technique)
* `failures` : Les échecs (les tests ont échoué car le comportement observé n'est plus celui attendu par les tests)

## Tester l'application

Il existe aujourd'hui une page qui permet de directement tester l'application dans un navigateur, elle est exposée dans `/test`. Il n'est pas recommandé d'exposer cet endpoint. Pour éviter cela, il suffit de lancer l'application avec un dans son environnement la variable `NODE_ENV` définie à autre chose que `development` (qui est la valeur par défaut).
