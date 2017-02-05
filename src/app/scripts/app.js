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
.config(function ($stateProvider, $urlRouterProvider, fsListerProvider, $mdDateLocaleProvider,$compileProvider) {

	$compileProvider.preAssignBindingsEnabled(true);
    fsListerProvider.options({ paging: { infinite: true, limit: 10 }, inline: true });

	$mdDateLocaleProvider.formatDate = function(date) {
		return moment(date).isValid() ? moment(date).format('MMM D, YYYY') : '';
    };

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
.run(function ($rootScope, BOWER, fsApi) {
    $rootScope.app_name = BOWER.name;
    $rootScope.app_namespace = BOWER.namespace;

    fsApi.on("begin",function(data, headers, options) {


    })
    .on("fail",function(response) {

        if (response.code === 401) {
            alert('Please login to access this page', { mode: 'toast' });
            throw response;
        }

        if (response.code === 403) {
            alert('You do not have access to complete this request.');
            throw response;
        }

        var messages = [];
        angular.forEach(response.response.data.messages,function(message) {
            messages.push(message.message);
        });

        alert(messages.join('<br/>'));
    });

});
