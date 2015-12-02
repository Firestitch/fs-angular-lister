(function () {
    'use strict';

    /* jshint latedef:nofunc */

    /**
     * @ngdoc directive
     * @name app.directive:colorContainer
     * @description
     * # alert
     */
    angular.module('app')
    .directive('colorContainer', function (alertService) {
        return {
            templateUrl: './views/directives/color-container.html',
            restrict: 'E',
            replace: false,
            link: function ($scope, element, attr) {
                $scope.attrs = attr;
            }
        };
    });
})();
