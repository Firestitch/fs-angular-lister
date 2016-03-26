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
    
    var ListerDirective = function ($compile, $sce, $filter, $window, $log, $q, $timeout, $mdDialog, fsStore) {

            /**
             * @ngdoc interface
             * @name app.controllers:ListerCtrl
             * @description
             * A factory that allows easy access to the lister directive instance
             */
            var ListerCtrl = ['$scope', function ($scope) {                

                var options = $scope.lsOptions;
                var persist = fsStore.get('lister-persist',{});

                options.paging = options.paging || {};
                options.paging.records = 0;
                options.paging.page = 1;
                options.paging.pages = 0;
                options.paging.enabled = true;
                options.paging.limits = options.paging.limits ? options.paging.limits : [5, 10, 25, 50, 100];
                options.paging.limit = options.paging.limit ? options.paging.limit : options.paging.limits[0];
                options.norecords = options.norecords===undefined ? 'No records found' : options.norecords;
                options.load = options.load===undefined ? true : options.load;
                options.actions = options.actions || [];
                options.filters = options.filters || [];

                angular.forEach(options.filters,function(filter) {

                    var persisted = persist[options.persist];

                    if(persisted) {
                        if(persisted[filter.name]) {                        
                           filter.default = persisted[filter.name];
                        }
                    }

                    filter.model = filter.default;

                    if(filter.type=='date') {
                            
                         if(typeof filter.model == 'string') {
                            filter.model = new Date(filter.model);
                         }
                    }

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
                $scope.topActions = options.topActions;
                $scope.load = load;
                $scope.loading = false;
                $scope.loaded = false;
                $scope.checked = [];
                $scope.selectToogled = false;
                $scope.debug = false;
                $scope.load = load;
                $scope.reload = reload;
                $scope.page = page;
                $scope.numeric = numeric;
                $scope.groupedFilters = function() {

                    var index = 0, filters = [];
                    angular.forEach(options.filters,function(filter) {

                        if(filter.type=='newline') {
                            return index++;
                        }

                        if(!filters[index])
                            filters[index] = [];

                        filters[index].push(filter);
                    });

                    return filters;
                }();

                $scope.actionClick = function(action, data, event, index) {
          
                    var helper = {  load: load,
                                    reload: reload,
                                    remove: function() {
                                        $scope.data.splice(index, 1);                                        
                                    },
                                    index: index
                                }

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
                                var result = action.delete.ok(data, event, helper);

                                if(result && angular.isFunction(result.then)) {
                                    result.then(function() {
                                        helper.remove();
                                    });
                                } else {
                                    helper.remove();
                                }
                            }
                        }, function() {
                            if(action.delete.cancel) {
                                action.delete.cancel(data, event, helper);
                            }
                        });
    
                    } else if(action.click) {
                        action.click(data, event, helper);
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
                               
                angular.forEach(options.filters,function(filter) {

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
                    load({ page: 1, clear: true });
                }

                function sanitizeAction(action) {
                    action = action || {};

                    if(action.delete) {
                        action.label = action.label || 'Remove';
                        action.icon = action.icon || 'delete';
                    }
                    
                    if(!action.show) {
                        action.show = function(){ return true }
                    }
                    
                    return action;
                }

                function filterValues() {
                    var query = {};
                    angular.forEach(options.filters,function(filter) {
                        if(filter.model!==null) {

                            if(filter.type=='select') {

                                if(filter.model!='__all')
                                    query[filter.name] = filter.model;

                            } else if(filter.type=='date') {

                                var date = filter.model;

                                if(date) {
                                    var sign = date.getTimezoneOffset() < 0 ? '+' : '-';
                                    query[filter.name] = $filter('date')(date, 'yyyy-MM-dd') + 'T00:00:00' + sign + String('00' + Math.abs(date.getTimezoneOffset() / 60)).slice(-2) + ':' + String('00' + Math.abs(date.getTimezoneOffset() % 60)).slice(-2);
                                }

                            } else if(filter.type=='range') {

                                if(filter.model && (filter.model['min'] || filter.model['max'])) {
                                    query[filter.name] = filter.model;
                                }

                            } else if(filter.model!==undefined && String(filter.model).length) {
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

                        if(opts.clear) {
                            opts.page = 1;
                        }

                        $scope.paging.page = opts.page;
                    }

                    var query = filterValues();

                    if(options.persist) {                        
                        persist[options.persist] = query;
                    }

                    query.page = $scope.paging.page;
                    query.limit = $scope.paging.limit;

                    log("Calling data()", query);
                    
                    var dataCallback = function(data, paging) {
                        if(opts.clear) {
                            $scope.max_bottom = 0;
                            $scope.data = [];
                        }

                        callback(data, paging);
                    }

                    try {
                        
                        $scope.loading = true;

                        if(options.data) {

                            var response = options.data(query, dataCallback);

                            if(response && response.then) {

                                response
                                .then(function(response) {
                                    dataCallback(response.data, response.paging);
                                });                                
                            }
                        }
                   
                   } catch(e) {
                        $scope.loading = false;
                        throw e;
                    }
                }
           
                 function page(page) {
                    $scope.paging.page = page;
                    load();
                }

                function callback(data, paging) {
                    
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

                            cols.push({ value: value, "className": col.className, data: object, resolve: col.resolve, scope: col.scope });
                        });

                        $scope.data.push({ cols: cols, object: object });
                    });                 

                    $scope.paging.enabled = !!paging;
                    $scope.paging.records = null;

                    if(paging) {
                        $scope.paging.records = paging.records;
                        $scope.paging.pages = paging.pages;
                        
                        if(paging.limit) {
                            $scope.paging.limit = paging.limit;
                            options.limit = paging.limit;
                        }
                    }

                    if($scope.options.paging.infinite) {
                        $scope.paging.page++;

                    } else if(paging) {
                        $scope.paging.page = paging.page;
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

                function numeric(n) { 
                      return !isNaN(parseFloat(n)) && isFinite(n); 
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
                
                $scope.max_bottom = 0;

                if($scope.lsOptions.paging.infinite) {

                    element = angular.element(element[0].children[0]);

                    var body = document.body,
                        html = document.documentElement,
                        threshhold = 200;

                    $scope.$on('$destroy', function () {
                        $timeout.cancel(timeout);
                    });

                    var timeout = null;

                    var load = function() {

                        if(!$scope.loading) {

                            var scrollTop = parseInt($window.pageYOffset);
                            var el_bottom = (parseInt(element.prop('offsetHeight')) + parseInt(element.prop('offsetTop')));
                            var wn_bottom = scrollTop + parseInt(window.innerHeight);
                            var condition = (el_bottom - threshhold) <= wn_bottom && (el_bottom > ($scope.max_bottom + threshhold));

                            if($scope.lsOptions.debug) {
                                var height = Math.max( body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight );

                                $log.log("Element top=" + element.prop('offsetTop'));
                                $log.log("Element height=" + element.prop('offsetHeight'));
                                $log.log("Scroll top=" + scrollTop + ", doc height=" + height + ", win height=" + window.innerHeight );
                                $log.log("Total= " + parseInt(scrollTop) + parseInt(window.innerHeight));
                                $log.log("Threshhold= " + threshhold);
                                $log.log("Element Bottom: " + el_bottom);
                                $log.log("Window Height: " + window.innerHeight);
                                $log.log("Window Bottom: " + wn_bottom);
                                $log.log("Max Bottom: " + $scope.max_bottom);
                                $log.log("If: ( (el_bottom - threshhold) ) <=  wn_bottom  && ( (el_bottom > ($scope.max_bottom + threshhold)) )");
                                $log.log("If: (" + (el_bottom - threshhold) + ") <= " + wn_bottom + " && (" + el_bottom  + " > " + ($scope.max_bottom + threshhold) + ") = " + condition);
                                $log.log("----------------------------------------------------------");
                            }

                            if(condition) {
                                $scope.max_bottom = el_bottom;
                                $scope.load();
                            }
                        }

                        timeout = $timeout(load,100);
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

                    $scope.data = $scope.col.data;

                    if($scope.col.scope) {
                        $scope = angular.extend($scope,$scope.col.scope);
                    }

                    if($scope.col.resolve) {
                        angular.forEach($scope.col.resolve, function(elem, index) {
                            var resolve = null;
                            if (typeof elem == 'function') {
                                resolve = $scope.$eval(elem);
                            }
                            else if (angular.isArray(elem) && angular.isFunction(elem[elem.length - 1])) {
                                resolve = $injector.invoke(elem, null, $scope);
                            }
                            $scope[index] = resolve;
                        });
                    }

                    angular.extend($scope, $scope.col.data);

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