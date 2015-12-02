(function () {
    'use strict';

    /* jshint latedef:nofunc */

    /**
     * @ngdoc service
     * @name app.historyService
     * @description
     * # historyService
     * A helper to set and get the last page visited.
     */
    angular.module('app')
    .factory('historyService', function ($rootScope) {
        var lastRoute,
        service = {
            set: set,
            get: get
        };

        return service;

        function set() {
            $rootScope.$on('$locationChangeStart',function(evt, absNewUrl, absOldUrl) {
                var hashIndex = absOldUrl.indexOf('#'),
                oldRoute = absOldUrl.substr(hashIndex + 1);

                lastRoute =  oldRoute;
            });
        }

        function get() {
            return lastRoute;
        }
    });
})();
