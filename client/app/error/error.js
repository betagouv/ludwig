'use strict'

angular.module('ludwigApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('layout.error', {
        url: '/error?message',
        templateUrl: 'app/error/error.html',
        controller: 'ErrorCtrl'
      })
  })
