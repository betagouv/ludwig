'use strict'

angular.module('ludwigApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('main', {
        url: '',
        templateUrl: 'app/main/main.html',
        controller: 'MainCtrl'
      })
  })
