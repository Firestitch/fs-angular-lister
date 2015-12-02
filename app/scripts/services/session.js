(function () {
    'use strict';

    /* jshint latedef:nofunc */

    /**
     * @ngdoc service
     * @name app.sessionService
     * @description
     * # sessionService
     * Factory in the app.
     */

    angular.module('app')
    .service('sessionService', function (storeService) {
        var service = {
            loggedIn: loggedIn,
            user: user,
            token: token,
            reset: reset
        };

        return service;

        function token(token) {

            if(arguments.length) {
                return storeService.set({ token: token });
            }

            return storeService.get('token');
        }

        function user(user) {

            if(arguments.length) {
                return storeService.set({ user: user });
            }

            return storeService.get('user');
        }

        function loggedIn(){
            return !!user();
        }

        function reset() {
            storeService.reset(['token','user']);
        }
    });
})();
