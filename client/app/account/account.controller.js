'use strict'

angular.module('ludwigApp')
  .controller('AccountCtrl', function ($scope, $state, LoginService, RepositoryService) {
    LoginService.get()
      .then(function (user) {
        if (!user) {
          return $state.go('layout.home')
        }

        $scope.user = user
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
