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
                `delete` — Used for delete confirmation. 
                    <ul><li>`title` — Title of confirmation. Default 'Confirm'.<br>
                    <li>`content` — Content of confirmation.<br>
                    <li>`ok` — Function when ok is clicked.<br>
                    <li>`cancel` — Function when cancel is clicked.<br>
                    <li>`okLabel` — Ok label. Default 'Ok'.<br>
                    <li>`cancelLabel` — Cancel label. Default 'Cancel'</ul>
    * @param {object} ls-options.action Simular to ls-options.actions but directly places the icon in the row instead of having the multiple option.
    * @param {bool} ls-options.load Loads the lister data on directive load. Default true
    * @param {object} ls-options.paging Configures paging
                <br><br>
                `infinite` — Enables infinite scroll<br>
                `limit` — Sets the limit per page
    * @param {object} ls-options.norecords The message to be displayed when there are no records in the search
    * @param {object} ls-options.selection Enables the checkbox selection interface found on the left side
    * @param {array} ls-options.selection.actions Sets the menus options for the selection interface
                <br><br>
                `label` — Used in the contextual menu item's label<br>
                `click` — Is triggered when the contextual menu item is clicked. First param an array of selected objects and the second param is the $event
                `icon` — Used in the contextual menu item icon               
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
    
    var ListerDirective = function ($compile, $sce, $filter, $window, $log, $q, $timeout, $mdDialog) {

            /**
             * @ngdoc interface
             * @name app.controllers:ListerCtrl
             * @description
             * A factory that allows easy access to the lister directive instance
             */
            var ListerCtrl = ['$scope', function ($scope) {                

                var options = $scope.lsOptions;

                options.paging = options.paging || {};
                options.paging.records = 0;
                options.paging.page = 1;
                options.paging.pages = 0;
                options.paging.enabled = true;
                options.paging.limits = options.paging.limits ? options.paging.limits : [5, 10, 25, 50, 100];
                options.paging.limit = options.paging.limit ? options.paging.limit : options.paging.limits[0];
                options.norecords = options.norecords===undefined ? 'No records found' : '';
                options.load = options.load===undefined ? true : options.load;
                options.actions = options.actions || [];
                options.filters = options.filters || [];

                angular.forEach(options.filters,function(filter) {
                    filter.model = filter.default;

                    if(filter.type=='range' && !filter.placeholder) {
                        filter.placeholder = ['Min','Max'];
                    }

                    if(filter.type=='select' && filter.default==undefined) {
                        filter.model = '__all';
                    }
                });

                sanitizeAction(options.action);
                angular.forEach(options.actions,function(action) {
                    sanitizeAction(action);
                });

                $scope.data = [];
                $scope.options = options;
                $scope.paging = options.paging;
                $scope.load = load;
                $scope.loading = false;
                $scope.loaded = false;
                $scope.filters = options.filters;
                $scope.checked = [];
                $scope.selectToogled = false;
                $scope.debug = false;
                $scope.load = load;
                $scope.page = page;

                $scope.actionClick = function(action, data, event) {
                   
                    if(action.delete) {

                       var confirm = $mdDialog
                        .confirm({  title: action.delete.title || 'Confirm',
                                    content: action.delete.content,
                                    targetEvent: event,
                                    ariaLabel: 'Remove',
                                    ok: action.delete.okLabel || 'Yes',
                                    cancel: action.delete.cancelLabel || 'Cancel' })
                       
                        $mdDialog.show(confirm)
                        .then(function() {
                            if(action.delete.ok) {
                                action.delete.ok(data, event);
                            }
                        }, function() {
                            if(action.delete.cancel) {
                                action.delete.cancel(data, event);
                            }
                        });
    
                    } else if(action.click) {
                        action.click(data, event);
                    }
                }

                $scope.selectionsToggle = function(toogle) {
                    
                    $scope.selectionsClear();
                    if(!toogle) {
                        
                        for(var i=0;i<$scope.data.length;i++) {
                            $scope.checked.push(1);
                        }
                    } else {
                        $scope.selectToogled = true;
                    }
                }


                $scope.selectMenu = function($mdOpenMenu, ev) {
                    $mdOpenMenu(ev);
                }

                $scope.select = function() {
                    $scope.selectToogled = false;
                }

                $scope.selectMenu = function(click, $event) {

                    var selected = [];
                    angular.forEach($scope.checked,function(value, index) {
                        if(value)
                            selected.push($scope.data[index].object);
                    });

                    click(selected, $event);
                }

                $scope.selectionsClear = function() {
                    $scope.checked = [];
                    $scope.selectToogled = false;                 
                }
                               
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

                function reload() {
                    $scope.data = [];
                    load({ page: 1 });
                }

                function sanitizeAction(action) {
                    action = action || {};
                    action.label = action.label || 'Remove';
                    action.icon = action.icon || 'delete';
                    return action;
                }

                function filterValues() {
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

                            } else if(filter.type=='range') {

                                if(filter.model && (filter.model['min'] || filter.model['max'])) {
                                    query[filter.name] = filter.model;
                                }

                            } else if(filter.model!=undefined) {
                                query[filter.name] = filter.model;
                            }
                        }
                    });

                    return query;
                }

                function load(opts) {

                    if($scope.loading)
                        return;

                    $scope.selectionsClear();

                    opts = opts || {};
                    if(opts.page) {
                        $scope.paging.page = opts.page;
                    }

                    var query = filterValues();
                    query.page = $scope.paging.page;
                    query.limit = $scope.paging.limit;

                    log("Calling data()", query);
                    
                    try {
                        
                        $scope.loading = true;
                        options.data(query, dataCallback);   
                   
                   } catch(e) {
                        $scope.loading = false;
                        throw e;
                    }
                }
           
                 function page(page) {
                    $scope.paging.page = page;
                    load();
                }

                function dataCallback(data,paging) {
                    
                    $scope.loaded = true;
                    log("dataCallback()",data,paging);

                    if(!$scope.options.paging.infinite) {
                        $scope.data = [];
                    }

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

                    if($scope.options.paging.infinite) {
                        $scope.paging.page++;

                    } else {

                        $scope.paging.enabled = !!paging;
                        
                        if(paging) {
                            $scope.paging.records = paging.records;
                            $scope.paging.page = paging.page;
                            $scope.paging.pages = paging.pages;
                            $scope.paging.limit = paging.limit;
                            options.limit = paging.limit;
                        }
                    }

                    $scope.loading = false;
                }

                function log(message) {
                    if($scope.debug) {
                        var args = Array.prototype.slice.call(arguments)
                        args.shift();
                        console.log(message,args);
                    }
                }

                if(options.load) {
                    load();
                }

                if($scope.lsInstance)
                    $scope.lsInstance = { load: load, page: page, reload: reload , filterValues: filterValues};
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
                
                if($scope.lsOptions.paging.infinite) {

                    element = angular.element(element[0].children[0]);

                    var body = document.body,
                        html = document.documentElement,
                        max_bottom = 0,
                        threshhold = 0;

                    $scope.$on('$destroy', function () {
                        $timeout.cancel(timeout);
                    });

                    var timeout = null;

                    var load = function() {

                        if(!$scope.loading) {

                            var scrollTop = parseInt($window.pageYOffset);
                            var el_bottom = (parseInt(element.prop('offsetHeight')) + parseInt(element.prop('offsetTop')));
                            var wn_bottom = scrollTop + parseInt(window.innerHeight);
                            var condition = (el_bottom - threshhold) <= wn_bottom && (el_bottom > (max_bottom + threshhold));

                            if(false) {
                                var height = Math.max( body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight );

                                $log.log("Element top=" + element.prop('offsetTop'));
                                $log.log("Element height=" + element.prop('offsetHeight'));
                                $log.log("Scroll top=" + scrollTop + ", doc height=" + height + ", win height=" + window.innerHeight );
                                $log.log("Total= " + parseInt(scrollTop) + parseInt(window.innerHeight));
                                $log.log("Threshhold= " + threshhold);
                                $log.log("Element Bottom: " + el_bottom);
                                $log.log("Window Height: " + window.innerHeight);
                                $log.log("Window Bottom: " + wn_bottom);
                                $log.log("Max Bottom: " + max_bottom);
                                $log.log("If: (" + (el_bottom - threshhold) + ") <= " + wn_bottom + " && (" + (el_bottom > (max_bottom + threshhold)) + ") = " + condition);
                                $log.log("----------------------------------------------------------");
                            }

                            if(condition) {
                                max_bottom = el_bottom;
                                $scope.load();
                            }
                        }

                        timeout = $timeout(load,1000);
                    }

                    load();
                }
            }
        }
    }


    angular.module('fs-angular-lister',[])
    .directive('lister',ListerDirective)
    .directive('fsLister',ListerDirective)
    .directive('compile', ['$compile', '$injector', '$location', '$timeout', function ($compile, $injector, $location, $timeout) {
        return function($scope, element, attrs) {

            $scope.$watch(
                function($scope) {
                    // watch the 'compile' expression for changes
                    return $scope.$eval(attrs.compile);
                },
                function(value) {

                    var inject = {};
                    $scope.data = $scope.col.data;

                    if($scope.col.scope) {
                        $scope = angular.extend($scope,$scope.col.scope);
                    }

                    if($scope.col.resolve) {
                        angular.forEach($scope.col.resolve, function(elem, index) {
                            var resolve = $scope.$eval(elem);
                            inject[index] = resolve;
                            $scope[index] = resolve;
                        });
                    }

                    angular.extend($scope, $scope.col.data);

                    inject.data = $scope.col.data;
                    inject.$scope = $scope;

                    /*
                    if(typeof value =='object') {

                        var func = value.pop();
                        var inject = value.slice(-1).pop();

                        value = $injector.invoke(func,null,inject);
                    }
                    */                    

                    element.html(value);
                    $compile(element.contents())($scope)

                    angular.forEach(element.find('a'),function(el) {

                        el = angular.element(el);                        

                        el.on('click',function(event) {

                            if(event.isDefaultPrevented()) {
                                return;
                            }
                            
                            if (!$location.$$html5 || event.metaKey || event.shiftKey || event.which == 2 || event.button == 2) return;

                            var el = angular.element(this);

                            if(event.ctrlKey) {

                                var href = el.attr('href');
                                el.attr('href',el.attr('href').replace(/^#/,''));
                                
                                $timeout(function() {
                                    el.attr('href', href);
                                });

                                return;
                            }
                           
                            $location.path(el.attr('href').replace(/^#/,''));
                            $scope.$apply();

                            return false;
                        });
                    });                    
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
    "\r" +
    "\n" +
    "<div class=\"lister\" ng-class=\"{ loading: loading, infinite: options.paging.infinite, paged: !options.paging.infinite }\">\r" +
    "\n" +
    "    \r" +
    "\n" +
    "    <div class=\"header\" layout=\"row\">\r" +
    "\n" +
    "\r" +
    "\n" +
    "        <div ng-repeat=\"filter in filters\" class=\"filter filter-{{filter.type}}\">\r" +
    "\n" +
    "\r" +
    "\n" +
    "            <md-input-container ng-if=\"filter.type == 'select'\">\r" +
    "\n" +
    "\r" +
    "\n" +
    "                <label>{{filter.label}}</label>\r" +
    "\n" +
    "\r" +
    "\n" +
    "                <md-select ng-model=\"filter.model\" md-on-close=\"load()\">\r" +
    "\n" +
    "                    <md-option\r" +
    "\n" +
    "                        ng-repeat=\"item in filter.values\"\r" +
    "\n" +
    "                        value=\"{{item.value}}\"\r" +
    "\n" +
    "                    >\r" +
    "\n" +
    "                    {{item.name}}\r" +
    "\n" +
    "                    </md-option>\r" +
    "\n" +
    "                </md-select>\r" +
    "\n" +
    "            </md-input-container>\r" +
    "\n" +
    "\r" +
    "\n" +
    "            <md-input-container ng-if=\"filter.type == 'text'\">\r" +
    "\n" +
    "\r" +
    "\n" +
    "                <label>{{filter.label}}</label>\r" +
    "\n" +
    "\r" +
    "\n" +
    "                <input\r" +
    "\n" +
    "                    ng-model=\"filter.model\"\r" +
    "\n" +
    "                    ng-model-options=\"{debounce: 300}\"\r" +
    "\n" +
    "                    ng-change=\"load()\"\r" +
    "\n" +
    "                    aria-label=\"{{filter.label}}\" />\r" +
    "\n" +
    "             </md-input-container>\r" +
    "\n" +
    "\r" +
    "\n" +
    "             <span ng-if=\"filter.type == 'range'\" layout=\"row\">\r" +
    "\n" +
    "                 <md-input-container class=\"filter-range-min\">\r" +
    "\n" +
    "\r" +
    "\n" +
    "                    <label>{{filter.label}}</label>\r" +
    "\n" +
    "\r" +
    "\n" +
    "                    <input\r" +
    "\n" +
    "                        placeholder=\"{{filter.placeholder[0]}}\"\r" +
    "\n" +
    "                        ng-model=\"filter.model['min']\"\r" +
    "\n" +
    "                        ng-model-options=\"{debounce: 300}\"\r" +
    "\n" +
    "                        ng-change=\"load()\"\r" +
    "\n" +
    "                        aria-label=\"{{filter.label}}\" />\r" +
    "\n" +
    "                 </md-input-container>\r" +
    "\n" +
    "\r" +
    "\n" +
    "                 <md-input-container class=\"filter-range-max\">\r" +
    "\n" +
    "\r" +
    "\n" +
    "                    <label>{{filter.label}}</label>\r" +
    "\n" +
    "\r" +
    "\n" +
    "                    <input\r" +
    "\n" +
    "                        placeholder=\"{{filter.placeholder[1]}}\"\r" +
    "\n" +
    "                        ng-model=\"filter.model['max']\"\r" +
    "\n" +
    "                        ng-model-options=\"{debounce: 300}\"\r" +
    "\n" +
    "                        ng-change=\"load()\"\r" +
    "\n" +
    "                        aria-label=\"{{filter.label}}\" />\r" +
    "\n" +
    "                 </md-input-container>\r" +
    "\n" +
    "            </span>\r" +
    "\n" +
    "            <span ng-if=\"filter.type == 'date'\" layout=\"row\">\r" +
    "\n" +
    "                <label>{{filter.label}}</label>\r" +
    "\n" +
    "                <md-datepicker ng-model=\"filter.model\" ng-change=\"load()\"></md-datepicker>\r" +
    "\n" +
    "            </span>\r" +
    "\n" +
    "\r" +
    "\n" +
    "        </div>\r" +
    "\n" +
    "\r" +
    "\n" +
    "    </div>    \r" +
    "\n" +
    "\r" +
    "\n" +
    "    <div class=\"lister-table\">        \r" +
    "\n" +
    "\r" +
    "\n" +
    "        <div class=\"lister-head\">\r" +
    "\n" +
    "            <div class=\"lister-row\">                \r" +
    "\n" +
    "                <div class=\"lister-col lister-select-toogle\" ng-show=\"options.selection\">\r" +
    "\n" +
    "                    <span ng-show=\"data.length\">\r" +
    "\n" +
    "                        <md-checkbox ng-click=\"selectionsToggle(selectToogled);\" ng-model=\"selectToogled\"  ng-true-value=\"true\" aria-label=\"Toggle Selection\"></md-checkbox>\r" +
    "\n" +
    "                        <md-menu md-offset=\"17 42\">\r" +
    "\n" +
    "                            <md-button aria-label=\"Select\" class=\"md-icon-button\" ng-click=\"$mdOpenMenu($event)\">\r" +
    "\n" +
    "                                <md-icon>arrow_drop_down</md-icon>\r" +
    "\n" +
    "                            </md-button>\r" +
    "\n" +
    "                            <md-menu-content>\r" +
    "\n" +
    "                                <md-menu-item ng-repeat=\"action in options.selection.actions\">\r" +
    "\n" +
    "                                    <md-button ng-click=\"selectMenu(action.click,$event)\">\r" +
    "\n" +
    "                                        <md-icon md-menu-align-target ng-show=\"action.icon\">{{action.icon}}</md-icon>\r" +
    "\n" +
    "                                        {{action.label}}\r" +
    "\n" +
    "                                    </md-button>\r" +
    "\n" +
    "                                </md-menu-item>\r" +
    "\n" +
    "                            </md-menu-content>\r" +
    "\n" +
    "                        </md-menu>\r" +
    "\n" +
    "                    </span>\r" +
    "\n" +
    "                </div>\r" +
    "\n" +
    "                <div class=\"lister-col\" ng-repeat=\"col in options.columns track by $index\">{{col.title}}</div>\r" +
    "\n" +
    "                <div class=\"lister-col\" ng-show=\"options.actions.length || options.action\"></div>\r" +
    "\n" +
    "            </div>\r" +
    "\n" +
    "        </div>\r" +
    "\n" +
    "        <div class=\"lister-body\">\r" +
    "\n" +
    "\r" +
    "\n" +
    "            <div class=\"progress-paged ng-hide\" ng-show=\"loading && !options.paging.infinite\">\r" +
    "\n" +
    "                <md-progress-circular md-mode=\"indeterminate\"></md-progress-circular>\r" +
    "\n" +
    "            </div>        \r" +
    "\n" +
    "            <div class=\"lister-row\" ng-class=\"{ selected: checked[$index] }\" ng-repeat=\"item in data\" ng-click=\"options.rowClick(item.object,$event); $event.stopPropagation();\">\r" +
    "\n" +
    "                <div class=\"lister-col\" ng-show=\"options.selection\"><md-checkbox ng-model=\"checked[$index]\" ng-true-value=\"1\" ng-click=\"select(item)\" aria-label=\"Select\"></md-checkbox></div>\r" +
    "\n" +
    "                <div class=\"lister-col {{col.class}}\" ng-repeat=\"col in item.cols track by $index\" compile=\"col.value\" cm-scope=\"col.scope\"></div>\r" +
    "\n" +
    "\r" +
    "\n" +
    "                <div class=\"lister-col lister-actions\" ng-if=\"options.action\">\r" +
    "\n" +
    "                    <md-button ng-click=\"actionClick(options.action,item.object,$event); $event.stopPropagation();\" class=\"md-icon-button\">\r" +
    "\n" +
    "                        <md-icon md-font-set=\"material-icons\" class=\"md-default-theme material-icons\">{{options.action.icon}}</md-icon>\r" +
    "\n" +
    "                     </md-button>\r" +
    "\n" +
    "                </div>\r" +
    "\n" +
    "\r" +
    "\n" +
    "                <div class=\"lister-col lister-actions\" ng-if=\"options.actions.length\">\r" +
    "\n" +
    "                    <md-menu>\r" +
    "\n" +
    "                        <md-button ng-click=\"$mdOpenMenu($event)\" class=\"md-icon-button\">\r" +
    "\n" +
    "                            <md-icon md-font-set=\"material-icons\" class=\"md-default-theme material-icons\">more_vert</md-icon>\r" +
    "\n" +
    "                        </md-button>\r" +
    "\n" +
    "                        <md-menu-content>\r" +
    "\n" +
    "                            <md-menu-item ng-repeat=\"action in options.actions track by $index\">\r" +
    "\n" +
    "                                <md-button ng-click=\"actionClick(action,item.object,$event)\">\r" +
    "\n" +
    "                                    <md-icon md-font-set=\"material-icons\" class=\"md-default-theme material-icons\">{{action.icon}}</md-icon>\r" +
    "\n" +
    "                                    {{action.label}}\r" +
    "\n" +
    "                                </md-button>\r" +
    "\n" +
    "                            </md-menu-item>\r" +
    "\n" +
    "                        </md-menu-content>\r" +
    "\n" +
    "                    </md-menu>\r" +
    "\n" +
    "                </div>\r" +
    "\n" +
    "            </div>\r" +
    "\n" +
    "        </div>\r" +
    "\n" +
    "    </div>\r" +
    "\n" +
    "\r" +
    "\n" +
    "    <div class=\"norecords ng-hide\" ng-show=\"loaded && options.norecords && !data.length\">{{options.norecords}}</div>\r" +
    "\n" +
    "    \r" +
    "\n" +
    "    <div class=\"progress-infinite ng-hide\" ng-show=\"loading && options.paging.infinite\">\r" +
    "\n" +
    "        <md-progress-circular md-mode=\"indeterminate\"></md-progress-circular>\r" +
    "\n" +
    "    </div>\r" +
    "\n" +
    "\r" +
    "\n" +
    "    <div class=\"paging ng-hide\" ng-show=\"paging.enabled && !options.paging.infinite\">\r" +
    "\n" +
    "\r" +
    "\n" +
    "        <div class=\"records\">\r" +
    "\n" +
    "            <p>{{paging.records}} Records</p>\r" +
    "\n" +
    "        </div>\r" +
    "\n" +
    "\r" +
    "\n" +
    "        <div class=\"limits\">\r" +
    "\n" +
    "            <md-input-container>\r" +
    "\n" +
    "                <label>Show</label>\r" +
    "\n" +
    "                <md-select ng-model=\"paging.limit\" md-on-close=\"load()\">\r" +
    "\n" +
    "                    <md-option\r" +
    "\n" +
    "                        ng-repeat=\"limit in options.paging.limits\"\r" +
    "\n" +
    "                        value=\"{{limit}}\">\r" +
    "\n" +
    "                        {{limit}} records\r" +
    "\n" +
    "                    </md-option>\r" +
    "\n" +
    "                </md-select>\r" +
    "\n" +
    "            </md-input-container>\r" +
    "\n" +
    "        </div>\r" +
    "\n" +
    "\r" +
    "\n" +
    "        <ul class=\"pages\" ng-if=\"paging.pages>1\">\r" +
    "\n" +
    "            <li ng-class=\"{ disabled : paging.page == 1 }\">\r" +
    "\n" +
    "                <a href=\"javascript:;\" ng-click=\"page(1)\">&laquo;</a>\r" +
    "\n" +
    "            </li>\r" +
    "\n" +
    "            <li ng-class=\"{ disabled : paging.page == 1 }\" class=\"ng-scope\">\r" +
    "\n" +
    "                <a href=\"\" ng-click=\"page(paging.page - 1)\" class=\"ng-binding\">‹</a>\r" +
    "\n" +
    "            </li>\r" +
    "\n" +
    "\r" +
    "\n" +
    "            <li ng-repeat=\"number in [] | listerRange:paging.pages:paging.page\" ng-class=\"{ active : paging.page == (number + 1), disabled : number == '...' }\">\r" +
    "\n" +
    "                <a href=\"\" ng-click=\"page(number + 1)\">{{ number + 1}}</a>\r" +
    "\n" +
    "            </li>\r" +
    "\n" +
    "\r" +
    "\n" +
    "            <li ng-class=\"{ disabled : paging.page == paging.pages }\" class=\"ng-scope\">\r" +
    "\n" +
    "                <a href=\"\" ng-click=\"page(paging.page + 1)\" class=\"ng-binding\">›</a>\r" +
    "\n" +
    "            </li>\r" +
    "\n" +
    "            <li ng-class=\"{ disabled : paging.page == paging.pages }\">\r" +
    "\n" +
    "                <a href=\"\" ng-click=\"page(paging.pages)\">&raquo;</a>\r" +
    "\n" +
    "            </li>\r" +
    "\n" +
    "        </ul>\r" +
    "\n" +
    "    </div>\r" +
    "\n" +
    "</div>\r" +
    "\n"
  );

}]);
