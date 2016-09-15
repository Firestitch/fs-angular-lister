'use strict';

angular
.module('app', [
    'config',
    'ngMaterial',
    'fs-angular-lister',
    'fs-angular-modal',
    'fs-angular-api',
    'ui.router'
])
.config(function ($stateProvider, $urlRouterProvider, fsListerProvider) {

    fsListerProvider.options({ paging: { infinite: true, limit: 10 }, inline: true });

    $urlRouterProvider
    .otherwise('/404')
    .when('', '/demo')
    .when('/', '/demo');

    $stateProvider
    .state('demo', {
        url: '/demo',
        templateUrl: 'views/demo.html',
        controller: 'DemoCtrl'
    })

    .state('404', {
        templateUrl: 'views/404.html',
        controller: 'DemoCtrl'
    });

})
.run(function ($rootScope, BOWER) {
    $rootScope.app_name = BOWER.name;
    $rootScope.app_namespace = BOWER.namespace;
});
