'use strict'

angular.module('ludwigApp')
  .factory('RepositoryService', function RepositoryService ($http) {
    return {
      getCandidates: function () {
        return $http.get('/api/repository/candidates')
          .then(function (response) { return response.data }, function () { return [] })
      },
      activateRepository: function (repositoryId) {
        return $http.post('/api/repository/', {
          id: repositoryId
        }).then(function (response) { return response.data }, function (error) { return { error: error } })
      }
    }
  })
