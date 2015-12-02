(function () {
    'use strict';

    /* jshint latedef:nofunc */

    /**
     * @ngdoc service
     * @name app.configService
     * @description
     * # configService
     * A factory that validates existing tokens and wraps the data request for a new token in a nice little promise.
     */
    angular.module('app')
    .factory('configService', function ($rootScope, CONFIG) {

        var service = { };

        service = angular.extend(service,CONFIG)
        $rootScope.config = CONFIG;

        return service;
    });
})();
