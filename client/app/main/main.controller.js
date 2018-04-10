'use strict'

angular.module('ludwigApp')
  .controller('MainCtrl', function ($scope, LoginService, RepositoryService) {
    $scope.auth = {}
    LoginService.get()
      .then(function (identities) {
        $scope.auth.identities = identities

        RepositoryService.getCandidates()
          .then(function (repositories) {
            $scope.repositories = repositories
          })
      })

    $scope.logout = function () {
      LoginService.delete()
        .then(function (result) {
          $scope.auth.logout = result
        })
    }
  })
