'use strict'

angular.module('ludwigApp')
  .controller('ErrorCtrl', function ($scope, $stateParams) {
    $scope.message = $stateParams.message
  })
