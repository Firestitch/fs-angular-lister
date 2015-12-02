/**
     * Get some item from the web
     * @param  {string} itemId The id of the items to retrieve
     * @return {Promise}       A promise to the returned item.
     */
(function () {
    'use strict';

    angular.module('app')
    .directive('lister', function ($compile, $sce) {
         return {
            templateUrl: './views/directives/lister.html',
            restrict: 'E',            
            scope: {
                conf: '=',
                instance: '='
            },

            controller: function($scope) {                

                $scope.rows = [];
                $scope.conf.limits = $scope.conf.limits ? $scope.conf.limits : [5, 10, 25, 50, 100];
                $scope.conf.limit = $scope.conf.limit ? $scope.conf.limit : $scope.conf.limits[0];
                $scope.paging = { records: 0, page: 1, pages: 0, limit: $scope.conf.limit };
                $scope.conf.actions = $scope.conf.actions || [];
                $scope.load = load;
                $scope.page = page;
                               

                function load() {
                    var query = {};

                    query.page = $scope.paging.page;
                    query.limit = $scope.paging.limit;

                    log("Calling data()", query);
                    $scope.conf.data(query, dataCallback);     
                }

                function page(page) {
                    $scope.paging.page = page;
                    load();
                }

                function dataCallback(data,paging) {
                    log("dataCallback()",data,paging);

                    $scope.rows = [];
                    angular.forEach(data,function(item) { 

                        var row = [];
                        angular.forEach($scope.conf.columns,function(col) { 
                            
                            var value = "";
                           
                            if(col.value)
                                value = col.value(item);

                            row.push({ value: value, "class": col.className, data: item });
                        });

                        $scope.rows.push(row);

                    });
                    
                    if(paging) {
                        $scope.paging.records = paging.records;
                        $scope.paging.page = paging.page;
                        $scope.paging.pages = paging.pages;
                        $scope.paging.limit = paging.limit;
                        $scope.conf.limit = paging.limit;

                    }
                }

                function log(message) {
                    var args = Array.prototype.slice.call(arguments)
                    args.shift();
                    console.log(message,args);
                }

                load();

                $scope.instance = { load: load, page: page };
            },

            link: function($scope, element, attr, ctrl) { }
        }
    })
    .directive('compile', ['$compile', function ($compile) {
        return function(scope, element, attrs) {
            scope.$watch(
                function(scope) {
                    // watch the 'compile' expression for changes
                    return scope.$eval(attrs.compile);
                },
                function(value) {
                    // when the 'compile' expression changes
                    // assign it into the current DOM
                    element.html(value);

                    // compile the new DOM and link it to the current
                    // scope.
                    // NOTE: we only compile .childNodes so that
                    // we don't get into infinite loop compiling ourselves
                    $compile(element.contents())(scope);
                }
            );
        };
    }])
    .filter('listerRange', function() {
      return function(input, total) {
        total = parseInt(total);

        for (var i=0; i<total; i++) {
          input.push(i);
        }

        return input;
      };
    });    

})();


