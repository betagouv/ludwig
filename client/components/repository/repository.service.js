'use strict';

angular.module('ludwigApp')
.factory('RepositoryService', function RepositoryService($q) {
  return {
    getAll: function() {
        return $q(function(resolve) {
            resolve([{
                id: 'github/sgmap/openfisca-france',
            }, {
                id: 'github/sgmap/openfisca-paris',
            }, {
                id: 'github/sgmap/openfisca-rennesmetropole',
            }]);
        });
    },
  };
});
