(function () {

    'use strict';
    angular.module('app')
    .controller('BodyCtrl', function ($scope, alertService) {
        $scope.$watch(alertService.get,function (alerts) {
            $scope.alerts = alerts;
        });
    });
})();
