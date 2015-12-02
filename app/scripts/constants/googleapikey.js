(function () {
    'use strict';

    /**
     * @ngdoc service
     * @name app.GOOGLEAPIKEY
     * @description
     * # GOOGLEAPIKEY
     * Constant in the app.
     */

    // Replace 'AIzaSyDKwxwfF3KWHrfiZwTVUWIfpQr89yH7ofo' with your Google API Key found here:
    //     https://console.developers.google.com/project
    var KEY = 'AIzaSyDKwxwfF3KWHrfiZwTVUWIfpQr89yH7ofo';

    angular.module('app')
    .constant('GOOGLEAPIKEY', KEY);
})();
