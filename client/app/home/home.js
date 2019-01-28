'use strict'

angular.module('ludwigApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('layout.home', {
        url: '/',
        templateUrl: 'app/home/home.html',
        controller: 'HomeCtrl'
      })
  })
