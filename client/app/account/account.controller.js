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
            $scope.candidates = repositories.filter(function (repo) {
              return $scope.user.repositories.indexOf(repo.full_name) < 0
            })
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
