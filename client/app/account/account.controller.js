'use strict'

angular.module('ludwigApp')
  .controller('AccountCtrl', function ($scope, $state, LoginService, RepositoryService) {
    LoginService.get()
      .then(function (identities) {
        if (identities === {}) {
          $state.go('layout.home')
        }

        $scope.auth = {identities: identities}
        RepositoryService.getCandidates()
          .then(function (repositories) {
            $scope.repositories = repositories
          })
      })

    $scope.logout = function () {
      LoginService.delete()
        .then(function () {
          $state.go('layout.home')
        })
    }

    $scope.activateRepository = RepositoryService.activateRepository
  })
