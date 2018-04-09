'use strict'

angular.module('ludwigApp')
  .controller('MainCtrl', function ($scope, LoginService, RepositoryService) {
    $scope.auth = {}
    LoginService.get()
      .then(function (identities) {
        $scope.auth.identities = identities
      })

    RepositoryService.getAll()
      .then(function (repositoryIds) {
        $scope.repositoryIds = repositoryIds
      })

    $scope.logout = function () {
      LoginService.delete()
        .then(function (result) {
          $scope.auth.logout = result
        })
    }
  })
