(function () {
    'use strict';
    
	angular.module('fs-angular-lister',[]);


})();
(function () {
    'use strict';


    /**
     * @ngdoc directive
     * @name app.directives:lister
     * @description
     * @restrict E
     * @param {object} ls-options Options to configure the Lister.
     * @param {function} ls-options.data When the load() function is called this data function is called with two parameters query and callback. 
                <ul>
                    <li> `query` — An object with the filters 
                    <li> `callback` — This call back function is expecting two parameters. The first an array of objects to populate the lister. The other a paging object with the following properties:
                        <br><br>
                        `records` — The number of records in the entire dataset (before any paging).<br>
                        `limit` — The number of records for paging<br>
                        `page` — The page number starting at one<br>
                        `pages` — The total number of pages in the entire dataset<br>
                </ul>  
     * @param {function} ls-options.rowClick Called when the row is clicked
     * @param {array} ls-options.actions Adds a column to the right side of the lister and places a button that a user can click to perform custom events <br><br>
                When actions array's length is greater then one the object supports:
                <br><br>
                `label` — Used in the contextual menu item's label<br>
                `click` — Is triggered when the contextual menu item is clicked<br>
                `icon` — Used in the contextual menu item icon<br><br>
                When actions array's length is equal to one the object supports:
                <br><br>
                `click` — Is triggered when the row's icon is clicked
     * @param {array} ls-options.columns Defines the columns for the lister<br><br>
                `title` — Specifies the column tile<br>
                `value` — Is triggered when the rendering the column and is passed a data parameter which corresponds to the row's record<br>
                `className` — A css class name that is appened to the column element<br>
                `resolve` — Used to inject objects in the value() function and inserts the values into the $scope variable<br>
                `scope` — Appended to the $scope object which is injected into the value() function
     * @param {array} ls-options.filters Defines the filters found above the lister table<br><br>
                `name` — the name in the query object passed to the fetch data process<br>
                `type` — select (single selection dropdown) or text (one line input box) or date<br>
                `label` — The label of the interface
                `values` — An key/value paired object with a list of filterable values. To avoid specifying a filter value use the key '__all'.  Applies only ror select type filters.<br>
                `default` — Sets the default filter value
        </tbody></table>
     * @param {object=} ls-instance Object to be two way binded. This can be useful when trying to access the directive functions.
                    ```html
                    <lister ls-instance="listerInstance"></lister>
                    ```

                    ```js
                    $scope.listerInstance = {}; 

                    function click() {
                        $scope.listerInstance.load();
                    }
                    ```
     */
    
    angular.module('fs-angular-lister',[])
    .directive('lister', function ($compile, $sce, $filter) {

            /**
             * @ngdoc interface
             * @name app.controllers:ListerCtrl
             * @description
             * A factory that allows easy access to the lister directive instance
             */
            var ListerCtrl = ['$scope', function ($scope) {                

                var options = $scope.lsOptions;

                options.limits = options.limits ? options.limits : [5, 10, 25, 50, 100];
                options.limit = options.limit ? options.limit : options.limits[0];
                options.actions = options.actions || [];
                options.filters = options.filters || [];

                angular.forEach(options.filters,function(filter) {                    
                    filter.model = filter.default;
                });

                $scope.data = [];
                $scope.options = options;
                $scope.paging = { records: 0, page: 1, pages: 0, limit: options.limit, enabled: false };                
                $scope.load = load;
                $scope.page = page;
                $scope.filters = options.filters;
                               
                angular.forEach($scope.filters,function(filter) {

                    if(typeof filter.values=='function') {
                        filter.values = filter.values();
                    }

                    var valuename = true;
                    angular.forEach(filter.values,function(value, key) {
                        valuename &= !!value.value;
                    });

                    if(!valuename) {
                        var values = [];
                        angular.forEach(filter.values,function(name, value) {
                            values.push({ name: name, value: value });
                        });

                        filter.values = values;
                    }
                });
                                           
                /**
                 * @ngdoc method
                 * @name load
                 * @methodOf app.controllers:ListerCtrl
                 * @description Triggers the loading of data
                 */
                function load() {
                    var query = {};

                    angular.forEach($scope.filters,function(filter) {
                        if(filter.model!==null) {

                            if(filter.type=='select') {

                                if(filter.model!='__all')
                                    query[filter.name] = filter.model;

                            } else if(filter.type=='date') {

                                var date = filter.model;

                                if(date) {

                                    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
                                    query[filter.name]  = $filter('date')(date, 'yyyy-MM-dd','+0000');
                                }
                            } else {
                                query[filter.name] = filter.model;
                            }
                        }                            
                    });

                    query.page = $scope.paging.page;
                    query.limit = $scope.paging.limit;

                    log("Calling data()", query);
                    options.data(query, dataCallback);     
                }
           
                 function page(page) {
                    $scope.paging.page = page;
                    load();
                }

                function dataCallback(data,paging) {
                    log("dataCallback()",data,paging);

                    $scope.data = [];
                    angular.forEach(data,function(object) { 

                        var cols = [];
                        angular.forEach(options.columns,function(col) {

                            var value = col.value;

                            if(typeof col.value =='function') {
                                value = col.value(object);
                            }

                            cols.push({ value: value, "class": col.className, data: object, resolve: col.resolve, scope: col.scope });
                        });

                        $scope.data.push({ cols: cols, object: object });
                    });

                    $scope.paging.enabled = !!paging;
                    
                    if(paging) {
                        $scope.paging.records = paging.records;
                        $scope.paging.page = paging.page;
                        $scope.paging.pages = paging.pages;
                        $scope.paging.limit = paging.limit;
                        options.limit = paging.limit;

                    }
                }

                function log(message) {
                    return;
                    var args = Array.prototype.slice.call(arguments)
                    args.shift();
                    console.log(message,args);
                }

                load();

                if($scope.lsInstance)
                    $scope.lsInstance = { load: load, page: page };
            }];

        return {
            templateUrl: 'views/directives/lister.html',
            restrict: 'E',            
            scope: {
                lsOptions: '=',
                lsInstance: '='
            },
            controller: ListerCtrl,
            link: function($scope, element, attr, ctrl) { 

            }
        }
    })
    .directive('compile', ['$compile', '$injector', function ($compile, $injector) {
        return function(scope, element, attrs) {
            scope.$watch(
                function(scope) {
                    // watch the 'compile' expression for changes
                    return scope.$eval(attrs.compile);
                },
                function(value) {

                    var inject = {};
                    scope.data = scope.col.data;

                    if(scope.col.scope) {
                        scope = angular.extend(scope,scope.col.scope);
                    }

                    if(scope.col.resolve) {
                        angular.forEach(scope.col.resolve, function(elem, index) {
                            var resolve = scope.$eval(elem);
                            inject[index] = resolve;
                            scope[index] = resolve;
                        });
                    }

                    angular.extend(scope, scope.col.data);

                    inject.data = scope.col.data;
                    inject.$scope = scope;

                    /*
                    if(typeof value =='object') {

                        var func = value.pop();
                        var inject = value.slice(-1).pop();

                        value = $injector.invoke(func,null,inject);
                    }
                    */                    

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
      return function(input, total, page) {

        var padding = 3;
        total = parseInt(total);

        for (var i=0; i<total; i++) {
          input.push(i);
        }  

        if(page<total)
            input = input.slice(page - padding - total , page - total).concat(input.slice(page, page + padding));
        else
            input = input.slice(padding * -1);

        return input;
      };
    });
})();
angular.module('fs-angular-lister').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('views/directives/lister.html',
    "<div class=\"lister\">\n" +
    "\n" +
    "    <div class=\"header\" layout=\"row\">\n" +
    "\n" +
    "        <div ng-repeat=\"filter in filters\">\n" +
    "\n" +
    "            <md-input-container ng-if=\"filter.type == 'select'\">\n" +
    "\n" +
    "                <label>{{filter.label}}</label>\n" +
    "\n" +
    "                <md-select ng-model=\"filter.model\" md-on-close=\"load()\">\n" +
    "                    <md-option\n" +
    "                        ng-repeat=\"item in filter.values\"\n" +
    "                        value=\"{{item.value}}\"\n" +
    "                    >\n" +
    "                    {{item.name}}\n" +
    "                    </md-option>\n" +
    "                </md-select>\n" +
    "            </md-input-container>\n" +
    "\n" +
    "             <md-input-container ng-if=\"filter.type == 'text'\">\n" +
    "\n" +
    "                <label>{{filter.label}}</label>\n" +
    "\n" +
    "                <input\n" +
    "                    ng-model=\"filter.model\"\n" +
    "                    ng-model-options=\"{debounce: 300}\"\n" +
    "                    ng-change=\"load()\"\n" +
    "                    aria-label=\"{{filter.label}}\" />\n" +
    "             </md-input-container>\n" +
    "\n" +
    "             <md-datepicker ng-model=\"filter.model\" ng-if=\"filter.type == 'date'\" ng-change=\"load()\" layout layout-fill md-placeholder=\"{{filter.label}}\"></md-datepicker>\n" +
    "\n" +
    "        </div>\n" +
    "\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"lister-table\">\n" +
    "        <div class=\"lister-head\">\n" +
    "            <div class=\"lister-row\">\n" +
    "                <div class=\"lister-col\" ng-repeat=\"col in options.columns track by $index\">{{col.title}}</div>\n" +
    "                <div class=\"lister-col\" ng-if=\"options.actions.length\"></div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div class=\"lister-body\">\n" +
    "            <div class=\"lister-row\" ng-repeat=\"item in data\" ng-click=\"options.rowClick(item.object,$event); $event.stopPropagation();\">\n" +
    "                <div class=\"lister-col\" ng-repeat=\"col in item.cols track by $index\" compile=\"col.value\" cm-scope=\"col.scope\" class=\"{{col.class}}\"></div>\n" +
    "\n" +
    "                <div class=\"lister-col lister-actions\" ng-if=\"options.actions.length==1\">\n" +
    "                    <md-button ng-repeat=\"action in options.actions track by $index\" ng-click=\"action.click(item.object,$event); $event.stopPropagation();\" class=\"md-icon-button\">\n" +
    "                        <md-icon md-font-set=\"material-icons\" class=\"md-default-theme material-icons\">more_vert</md-icon>\n" +
    "                     </md-button>\n" +
    "                </div>\n" +
    "\n" +
    "                <div class=\"lister-col lister-actions\" ng-if=\"options.actions.length>1\">\n" +
    "                    <md-menu>\n" +
    "                     <md-button ng-click=\"$mdOpenMenu($event)\" class=\"md-icon-button\">\n" +
    "                        <md-icon md-font-set=\"material-icons\" class=\"md-default-theme material-icons\">more_vert</md-icon>\n" +
    "                     </md-button>\n" +
    "                     <md-menu-content>\n" +
    "                        <md-menu-item ng-repeat=\"action in options.actions track by $index\">\n" +
    "                            <md-button ng-click=\"action.click(item.object,$event)\">\n" +
    "                                <md-icon md-font-set=\"material-icons\" class=\"md-default-theme material-icons\">{{action.icon}}</md-icon>\n" +
    "                                {{action.label}}\n" +
    "                            </md-button>\n" +
    "                        </md-menu-item>\n" +
    "                    </md-menu-content>\n" +
    "                    </md-menu>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"paging ng-hide\" ng-show=\"paging.enabled\">\n" +
    "\n" +
    "        <div class=\"records\">\n" +
    "            <p>{{paging.records}} Records</p>\n" +
    "        </div>\n" +
    "\n" +
    "        <div class=\"limits\">\n" +
    "            <md-input-container>\n" +
    "                <label>Show</label>\n" +
    "                <md-select ng-model=\"paging.limit\" md-on-close=\"load()\">\n" +
    "                    <md-option\n" +
    "                        ng-repeat=\"limit in options.limits\"\n" +
    "                        value=\"{{limit}}\">\n" +
    "                        {{limit}} records\n" +
    "                    </md-option>\n" +
    "                </md-select>\n" +
    "            </md-input-container>\n" +
    "        </div>\n" +
    "\n" +
    "        <ul class=\"pages\" ng-if=\"paging.pages>1\">\n" +
    "            <li ng-class=\"{ disabled : paging.page == 1 }\">\n" +
    "                <a href=\"javascript:;\" ng-click=\"page(1)\">&laquo;</a>\n" +
    "            </li>\n" +
    "            <li ng-class=\"{ disabled : paging.page == 1 }\" class=\"ng-scope\">\n" +
    "                <a href=\"\" ng-click=\"page(paging.page - 1)\" class=\"ng-binding\">‹</a>\n" +
    "            </li>\n" +
    "\n" +
    "            <li ng-repeat=\"number in [] | listerRange:paging.pages:paging.page\" ng-class=\"{ active : paging.page == (number + 1), disabled : number == '...' }\">\n" +
    "                <a href=\"\" ng-click=\"page(number + 1)\">{{ number + 1}}</a>\n" +
    "            </li>\n" +
    "\n" +
    "            <li ng-class=\"{ disabled : paging.page == paging.pages }\" class=\"ng-scope\">\n" +
    "                <a href=\"\" ng-click=\"page(paging.page + 1)\" class=\"ng-binding\">›</a>\n" +
    "            </li>\n" +
    "            <li ng-class=\"{ disabled : paging.page == paging.pages }\">\n" +
    "                <a href=\"\" ng-click=\"page(paging.pages)\">&raquo;</a>\n" +
    "            </li>\n" +
    "        </ul>\n" +
    "    </div>\n" +
    "</div>\n"
  );

}]);