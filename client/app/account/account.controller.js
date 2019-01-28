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

    $scope.activateRepository = function (repository) {
      RepositoryService.activateRepository(repository)
        .then(function (repository) {
          if (repository.error) {
            return
          }

          $scope.user.repositories.push(repository.id)
          var idx = $scope.candidates.findIndex(function (repo) {
            return repo.full_name === repository.id
          })
          if (idx > -1) {
            $scope.candidates.splice(idx, 1)
          }
        })
    }
  })
