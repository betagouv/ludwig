'use strict'

angular.module('ludwigApp')
  .factory('RepositoryService', function RepositoryService ($http) {
    return {
      getCandidates: function () {
        return $http.get('/api/repositories/candidates')
          .then(function (response) { return response.data }, function () { return [] })
      }
    }
  })
