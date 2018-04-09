'use strict'

angular.module('ludwigApp')
  .controller('MainCtrl', function ($scope, LoginService, RepositoryService) {
    LoginService.get()
      .then(function (identities) {
        $scope.identities = identities
      })

    RepositoryService.getAll()
      .then(function (repositoryIds) {
        $scope.repositoryIds = repositoryIds
      })
  })
