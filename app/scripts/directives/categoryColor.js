(function () {
    'use strict';

    angular.module('app')
    .directive('categoryColor', lister);

    function lister() {
        return {
            templateUrl: './views/directives/categoryColor.html',
            restrict: 'E',            
            scope: {
                conf: '='
            },
            link: {

            }
        }
    }    

})();