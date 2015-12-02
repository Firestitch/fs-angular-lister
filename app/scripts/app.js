'use strict';

/**
 * @ngdoc overview
 * @name app
 * @description
 * # app
 *
 * Main module of the application.
 */

angular
.module('app', [
    'config',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'ngMaterial',
    'ngAnimate',
    'ngStorage',
    'mdo-angular-cryptography',
])
.config(function ($routeProvider, $cryptoProvider, $mdThemingProvider, CONFIG) {
    $routeProvider
    .when('/lister', {
        templateUrl: 'views/lister.html',
        controller: 'ListerCtrl',       
    })

    .when('/404', {
        templateUrl: 'views/404.html'
    })
    .otherwise({
        redirectTo: '/lister'
    });

    $cryptoProvider.setCryptographyKey('abc123');

})
.run(function (historyService, Pollyfills, appService, $rootScope, alertService, $route) {

});
