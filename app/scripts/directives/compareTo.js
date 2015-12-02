(function () {
    'use strict';

    /* jshint latedef:nofunc */

    /**
     * @ngdoc directive
     * @name app.directive:compareTo
     * @description
     * # compareTo
     */
    angular.module('app')
    .directive('compareTo', function () {
        return {
            require: "ngModel",
            scope: {
                otherModelValue: "=compareTo"
            },
            link: function(scope, element, attributes, ngModel) {

                ngModel.$validators.compareTo = function(modelValue) {
                    return modelValue == scope.otherModelValue;
                };

                scope.$watch("otherModelValue", function() {
                    ngModel.$validate();
                });
            }
        };
    });
})();
