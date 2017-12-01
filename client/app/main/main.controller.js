'use strict'

angular.module('ludwigApp')
  .controller('MainCtrl', function ($scope, RepositoryService) {
    RepositoryService.getAll()
      .then(function (repositoryIds) {
        $scope.repositoryIds = repositoryIds
      })
  })
