(function () {
    'use strict';

    /**
     * @ngdoc service
     * @name app.storeService
     * @description
     * # storeService
     * A factory that allows easy access to the encrypted session in local storage.
     */
    angular.module('app')
    .factory('storeService', function ($crypto, $localStorage, $log) {
        var service = {
            set: set,
            get: get,
            reset: reset,
            remove: remove,
            display: display
        },
        encryption = false;

        return service;

        /**
         * @ngdoc method
         * @name get
         * @methodOf app.storeService
         * @description Gets the saved session from local storage, decrypts it and returns the object. An optional string can be passed in to return a specific value from the session.
         * @param {String} [str] - Optional, input the key for the value you want fetch from local storage.
         * @return {Object} Returns the decrypted session or the requested value from local storage.
         */
        function get(str) {

            var val = $localStorage[str];
            if(val && encryption) {
                val = decrypt(val);
            }

            return (typeof val === 'undefined') ? null : val;
        }


        /**
         * @ngdoc method
         * @name set
         * @methodOf app.storeService
         * @description Saves an object as an encrypted session in local storage.
         * @param {Object} obj - Input the object you want set as your session in local storage.
         */
        function set(obj,value) {

            //if both these variables are set then treat as key value pair
            if(obj && value) {
                var obj1 = {};
                obj1[obj] = value;
                obj = obj1;
            }

            if (typeof obj === 'object') {
                // if object is a proper object, process normally
                angular.forEach(obj, function (val, key) {
                    if(encryption)
                        val = encrypt(val);
                    $localStorage[key] = val;

                });
            }
        }

        /**
         * @ngdoc method
         * @name remove
         * @methodOf app.storeService
         * @description Removes all saved local storage.
         */
        function remove(obj) {

            if(obj) {
                obj = typeof obj === 'object' ? obj : [obj];

                angular.forEach(obj,function(value) {
                    delete $localStorage[value];
                });
            }
        }

        function reset() {
            $localStorage.$reset();
        }


        /**
         * @ngdoc function
         * @name encrypt
         * @methodOf app.storeService
         * @description Encrypts an object.
         * @param {Object}  obj - Input an object to convert it to an encrypted string.
         * @returns {String} An encrypted string.
         */
        function encrypt(obj) {

            obj = JSON.stringify(obj);
            obj = $crypto.encrypt(obj);

            return obj;
        }

        /**
         * @ngdoc function
         * @name decrypt
         * @methodOf app.storeService
         * @description Decrypts a string.
         * @param {String}  str - Input an encrypted string to convert it to an object.
         * @returns {Object} An object.
         */
        function decrypt(obj) {
            obj = $crypto.decrypt(obj);

            if(obj)
                obj = JSON.parse(obj);

            return obj;
        }

        function display() {

            angular.forEach($localStorage,function(value,key) {
                if(typeof value === 'string') {
                    $log.info({ key: key, value: decrypt(value) });
                }
            });
        }

    });
})();
