'use strict'

angular.module('ludwigApp')
  .factory('LoginService', function RepositoryService ($http) {
    return {
      get: function () {
        return $http.get('/login')
          .then(function (response) { return response.data }, function () { return null })
      },
      delete: function () {
        return $http.delete('/login')
          .then(function (response) { return response.data }, function () { return null })
      }
    }
  })
