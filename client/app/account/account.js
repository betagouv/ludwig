'use strict'

angular.module('ludwigApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('layout.account', {
        url: '/account',
        templateUrl: 'app/account/account.html',
        controller: 'AccountCtrl'
      })
  })
