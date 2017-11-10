'use strict'

angular.module('ludwigApp')
  .controller('MainCtrl', function ($scope, RepositoryService) {
    RepositoryService.getAll()
      .then(function (repositories) {
        $scope.repositories = repositories
      })
  })
