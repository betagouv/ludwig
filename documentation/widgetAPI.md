Aujourd'hui, le widget met à disposition plusieurs fonctions :

* `generateSuggestionURL(currentState, expectedResult [, customSuggestionFormatter] )` : Génère une URL permettant d'ajouter un fichier correspondant à une suggestion. L'état collecté par l'application ainsi que le résultat attendu seront sérialisés dans la requête.
Il est possible de préciser à la méthode une fonction personnalisée pour sérialiser le template, l'état et le résultat attendu. Cette fonction doit prendre 2 paramètres (état courant et résultat attendu) et renvoyer une chaîne de caractères (qui sera ensuite échappée par Ludwig).
**ATTENTION** : Cette utilisation est limitée par GitHub pour les URIs trop longues (~8000 caractères). L'API retournera une erreur si la longueur totale de l'URI générée par le widget dépasse cette taille.
* `generateSuggestionName()` : Génère un nom de suggestion qui se base sur le préfixe configuré et la date courante.
* `acceptedTestsURL()` : Génère l'URL permettant d'accéder à la liste des tests acceptés.
* `suggestedTestsURL()` : Génère l'URL permettant de consulter les suggestions de tests.
* `generateLudwigSuggestionEndpointURL(suggestionTitle, suggestionDescription, currentState, expectedResult)` : Crée le lien qui permet de contacter l'API Ludwig pour créer une nouvelle suggestion. Cela permet de fournir un titre et une description en plus de l'état et du résultat attendu.
