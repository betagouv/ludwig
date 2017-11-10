'use strict'

angular.module('ludwigApp')
  .factory('RepositoryService', function RepositoryService ($http) {
    return {
      getAll: function () {
        return $http.get('/api/repositories')
          .then(function (response) { return response.data }, function () { return [] })
      }
    }
  })
