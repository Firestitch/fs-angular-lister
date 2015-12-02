(function () {
    'use strict';

    /**
     * @ngdoc service
     * @name app.appService
     * @description
     * # appService
     * Factory in the app.
     */
    angular.module('app')
    .factory('appService', function (apiService) {
       
        var service = {
            init: init
        };
       
        return service;

        function init() {
            return apiService.get('app/init');
        }
    });
})();
