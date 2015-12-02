(function () {
    'use strict';

    /* jshint latedef:nofunc */

    /**
     * @ngdoc directive
     * @name app.directive:alert
     * @description
     * # alert
     */
    angular.module('app')
    .directive('alerts', function (alertService) {
        return {
            templateUrl: './views/directives/alerts.html',
            restrict: 'E',
            replace: true,
            link: function ($scope, attrs) {

                $scope.alerts = [];
                $scope.$watch(alertService.get,function (alerts) {
                    $scope.alerts = alerts;
                });

            }
        };
    });
})();
