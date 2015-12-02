(function () {

    'use strict';

    /* jshint latedef:nofunc */

    /**
     * @ngdoc function
     * @name app.controller:BodyCtrl
     * @description
     * # BodyCtrl
     * Controller of the app
     */
    angular.module('app')
    .controller('BodyCtrl', function ($scope, alertService) {
        $scope.$watch(alertService.get,function (alerts) {
            $scope.alerts = alerts;
        });
    });
})();
