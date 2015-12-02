'use strict';

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
    'lister'
])
.config(function ($routeProvider, $cryptoProvider, $mdThemingProvider, CONFIG) {
    $routeProvider
    .when('/lister', {
        templateUrl: 'views/lister.html',
        controller: 'ListerrCtrl',       
    })

    .when('/404', {
        templateUrl: 'views/404.html'
    })
    .otherwise({
        redirectTo: '/lister'
    });

    $cryptoProvider.setCryptographyKey('abc123');

})
.run(function () {

});
