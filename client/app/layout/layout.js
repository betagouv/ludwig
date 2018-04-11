'use strict'

angular.module('ludwigApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('layout', {
        url: '',
        templateUrl: 'app/layout/layout.html',
        abstract: true
      })
  })
