'use strict'

angular.module('ludwigApp').controller('testerCtrl', function ($http, $scope) {
  $scope.renew = function () {
    delete $scope.externalLink
    return {
      title: 'Titre',
      body: 'Corps',
      content: 'Contenu'
    }
  }

  $scope.props = $scope.renew()

  $scope.send = function () {
    $scope.isSending = true
    $http.post('api/repository/' + $scope.repository + '/suggest', $scope.props)
      .then(function (response) {
        return response.data
      })
      .then(function (payload) {
        $scope.externalLink = payload.data.html_url
      })
      .catch(function (err) {
        $scope.error = err
      })
      .finally(function () {
        delete $scope.isSending
      })
  }
})

angular.module('ludwigApp')
  .directive('tester', function () {
    return {
      restrict: 'E',
      templateUrl: 'components/tester/tester.html',
      scope: {
        repository: '='
      },
      controller: 'testerCtrl'
    }
  })
