(function () {
    'use strict';

    /* jshint latedef:nofunc */

    /**
     * @ngdoc service
     * @name app.authService
     * @description
     * # authService
     * A factory to authenticate user access and save their credentials to the ongoing session.
     */
    angular.module('app')
    .factory('authService', function ($q, $location, $timeout, apiService, sessionService) {
        var service = {
            login: login,
            logout: logout,
            init: init
        };

        return service;

        /**
         * @ngdoc method
         * @name login
         * @methodOf app.authService
         * @description Cleans up the user input and passes the user credentials to the getUser method.
         * @param {Object} user - User email and password.
         * @return {Object} Promised object from the login api.
         */
        function login(data) {

            return apiService.post('auth/login', data)
            .then(function(response) {
                sessionService.user(response.user);
                sessionService.token(response.token);
            });
        }

        /**
         * @ngdoc method
         * @name logout
         * @methodOf app.authService
         * @description Logs the user out by destroying the session and redirecting to the home page.
         */
        function logout() {

            apiService.post('auth/logout');
                        
            sessionService.reset();
            $timeout(function () {
                $location.path('/');
            }, 500);
        }

        function init() {          

            if(sessionService.token()) {
                var deferred = $q.defer();
                deferred.resolve();
                return deferred.promise;
            }
           
            return apiService.post('auth/token', {}, { key: 'token' })
            .then(function(token) {
                sessionService.token(token);
            });
        }
    });
})();


