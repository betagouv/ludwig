'use strict'

angular.module('ludwigApp')
  .controller('HomeCtrl', function ($scope, LoginService, RepositoryService) {
    $scope.auth = {}
    LoginService.get()
      .then(function (identities) {
        $scope.auth.identities = identities

        RepositoryService.getCandidates()
          .then(function (repositories) {
            $scope.repositories = repositories
          })
      })

    $scope.activateRepository = RepositoryService.activateRepository

    $scope.logout = function () {
      LoginService.delete()
        .then(function (result) {
          $scope.auth.logout = result
        })
    }
  })
