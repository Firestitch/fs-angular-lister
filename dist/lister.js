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
    
    var ListerDirective = function ($compile, $sce, $filter, $window, $log, $q, $timeout, $mdDialog, fsStore, $rootScope, fsLister, $location) {

            /**
             * @ngdoc interface
             * @name app.controllers:ListerCtrl
             * @description
             * A factory that allows easy access to the lister directive instance
             */
            var ListerCtrl = ['$scope', function ($scope) {                

                var options = angular.extend({},fsLister.options(),$scope.lsOptions);
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

                    filter.model = filter.default;

                    if(options.persist) {
                        var persisted = persist[options.persist];

                        if(persisted) {
                            if(persisted[filter.name]!==undefined) {
                               filter.model = persisted[filter.name];
                            }
                        }
                    }

                    if(filter.param) {
                        var search = $location.search();

                        if(search[filter.param]) {
                            filter.model = search[filter.param];
                        }
                    }                    

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
                $scope.checked = [];
                $scope.selectToogled = false;
                $scope.debug = false;
                $scope.load = load;
                $scope.reload = reload;
                $scope.page = page;
                $scope.numeric = numeric;
                $scope.extended_search = false;
                $scope.searchinput = '';
                
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

                $scope.actionClick = function(action, item, event) {

                    var index = $scope.data.indexOf(item);

                    var helper = {  load: load,
                                    reload: reload,
                                    remove: function() {
                                        if(this.index!==null) {
                                            $scope.data.splice(this.index, 1);
                                        }
                                    },
                                    index: index>=0 ? index : null
                                }

                    if(action.delete) {

                        var confirm = { template: [
                                        '<md-dialog md-theme="{{ dialog.theme }}" aria-label="{{ dialog.ariaLabel }}" class="{{ dialog.css }}">',
                                        ' <md-dialog-content class="md-dialog-content" tabIndex="-1">',
                                        '   <h2 class="md-title">{{ dialog.title }}</h2>',
                                        '   {{dialog.mdTextContent}}',
                                        ' </md-dialog-content>',
                                        ' <md-dialog-actions>',
                                        '   <md-button ng-click="dialog.cancel($event)">',
                                        '     Cancel',
                                        '   </md-button>',
                                        '   <md-button ng-click="dialog.ok($event)" class="md-accent" md-autofocus="dialog.$type!=\'confirm\'">',
                                        '     Yes',
                                        '   </md-button>',
                                        ' </md-dialog-actions>',
                                        '</md-dialog>'
                                        ].join('').replace(/\s\s+/g, ''),
                                        controller: function () {
                                            this.ok = function() {

                                                if(action.delete.ok) {
                                                    var result = action.delete.ok(item.object, event, helper);

                                                    if(result && angular.isFunction(result.then)) {
                                                        result.then(function() {
                                                            helper.remove();
                                                            $mdDialog.hide(true);
                                                        });
                                                    } else {
                                                        helper.remove();
                                                        $mdDialog.hide(true);
                                                    }
                                                }
                                                
                                            };
                                            this.cancel = function($event) {

                                                if(action.delete.cancel) {
                                                    action.delete.cancel(item.object, event, helper);
                                                }                                                
                                                $mdDialog.hide();
                                            };
                                        },
                                        preserveScope: true,
                                        controllerAs: 'dialog',
                                        bindToController: true,
                                        title: action.delete.title || 'Confirm',
                                        content: action.delete.content,
                                        targetEvent: event,
                                        ariaLabel: 'Confirm',
                                        skipHide: true };
                            
                        $mdDialog.show(confirm);

                    } else if(action.click) {
                        action.click(item.object, event, helper);
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

                $scope.toggleFilters = function() {
                    $scope.extended_search = !$scope.extended_search;
                }

                $scope.search = function() {

                    angular.forEach(options.filters,function(filter) {
                        $scope.filterValue(filter);
                    });

                    $scope.searchInputUpdate();
                    $scope.extended_search = false;
                    reload();
                }

                $scope.searchInputUpdate = function() {

                    var searches = [];
                    angular.forEach(options.filters,function(filter) {

                        if(filter.value!==null) {

                            var value = filter.value;

                            if(value.match(/\s/))
                                value = '(' + filter.value + ')';

                            searches.push(filter.name + ':' + value);
                        }
                    });

                    $scope.searchinput = searches.join(' ');
                }

                $scope.searchChange = function(search) {

                    var matches = search.match(/([^:]+:\([^\)]+\)|[^\s]+)/g);

                    var values = {};
                    angular.forEach(matches, function(match) {

                        var filter_match = match.match(/([^:]+):\(?([^)]+)/);

                        if(filter_match) {
                            values[filter_match[1]] = filter_match[2];
                        }
                    });
                    
                    var primary = false;
                    angular.forEach(options.filters,function(filter) {
                        
                        filter.model = null;
                        var value = values[filter.name];
                        if(value) {

                            if(filter.type=='date') {
                                filter.model = new Date(value);

                            } else if(filter.type=='range') {
                                var parts = value.split(',');
                                filter.model = { min: parts[0], max: parts[1] };
                            } else {
                                filter.model = value;
                            }
                        }

                        if(Object.keys(values).length === 0 && !primary && filter.type=='text') {
                            filter.model = search;
                            primary = true;
                        }

                        $scope.filterValue(filter);
                    });                           

                    reload();
                 }

                $scope.filterValue = function(filter) {

                    filter.value = null;

                    if(filter.type=='select') {

                        if(filter.multiple) {

                            if(angular.isArray(filter.model)) {
                                filter.value = filter.model.join(',');
                            }

                        } else if(filter.model!='__all')  {
                            filter.value = filter.model;
                        }

                    } else if(filter.type=='date') {

                        var date = filter.model;

                        if(date) {
                            var sign = date.getTimezoneOffset() < 0 ? '+' : '-';
                            filter.value = $filter('date')(date, 'yyyy-MM-dd') + 'T00:00:00' + sign + String('00' + Math.abs(date.getTimezoneOffset() / 60)).slice(-2) + ':' + String('00' + Math.abs(date.getTimezoneOffset() % 60)).slice(-2);
                        }

                    } else if(filter.type=='range') {
                        
                        if(filter.model) {
                            var min = filter.model['min'];
                            var max = filter.model['max'];

                            var parts = [];
                            if(min) {
                                parts.push(min);
                            }

                            if(max) {
                                parts.push(max);
                            }

                            if(parts.length) {
                                filter.value = parts.join(',');
                            }
                        }

                    } else if(filter.model!==undefined && String(filter.model).length) {
                        filter.value = filter.model;
                    }
                }

                $scope.filterChange = function(filter) {
                    $scope.filterValue(filter);
                    reload();
                }

                $scope.columnStyle = function(col) {
                    var styles = {};

                    if(col.width) {
                        styles.width = col.width;
                    }

                    if(col.center) {
                        styles.textAlign = 'center';
                    }

                    return styles;
                }

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
                        
                        if(filter.value!==null) {
                            query[filter.name] = filter.value;
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

                        var models = {};
                        angular.forEach(options.filters,function(filter) {                            
                            models[filter.name] = filter.model;
                        });

                        persist[options.persist] = models;
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

                            cols.push({ column: col, value: value, data: object });
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

                    $scope.filterValue(filter);
                });

                $scope.searchInputUpdate();

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

                if($scope.lsOptions.paging && $scope.lsOptions.paging.infinite) {

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
    .directive('fsListerCompile', ['$compile', '$injector', '$location', '$timeout', '$rootScope', function ($compile, $injector, $location, $timeout, $rootScope) {        
        return {    scope: {
                        column: '=fsColumn',
                        data: '=fsData',
                        value: '=fsListerCompile'
                    },
                    link: function($scope, element, attrs, ctrl) {

                        var scope = $rootScope.$new();
                        scope.data = $scope.data;

                        if($scope.column.scope) {
                            scope = angular.extend($scope,$scope.column.scope);
                        }

                        if($scope.column.resolve) {
                            angular.forEach($scope.column.resolve, function(elem, index) {
                                var resolve = null;
                                if (typeof elem == 'function') {
                                    resolve = elem($scope.data);
                                }
                                else if (angular.isArray(elem) && angular.isFunction(elem[elem.length - 1])) {
                                    resolve = $injector.invoke(elem, null, scope);
                                }
                                scope[index] = resolve;
                            });
                        }

                        element.html($scope.value);
                        $compile(element.contents())(scope);
                       
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
        }
    }])
    .provider("fsLister",function() {

        var _options = {};
        this.options = function(options) {
            _options = options;
        }

        this.$get = function () {

            var service = { options: options };

            return service;

            function options() {
                return _options;
            }
        }
    })
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
    "<div class=\"lister\" ng-class=\"{ loading: loading, infinite: options.paging.infinite, paged: !options.paging.infinite }\">\r" +
    "\n" +
    "\r" +
    "\n" +
    "    <div layout=\"row\" layout-align=\"start\" class=\"search\" ng-show=\"options.filters.length\">\r" +
    "\n" +
    "        <div ng-show=\"options.inline\" layout=\"row\" class=\"ng-hide inline-search\" flex=\"grow\">\r" +
    "\n" +
    "            <div class=\"inline-search-input\" flex=\"grow\">\r" +
    "\n" +
    "                <md-input-container md-no-float>\r" +
    "\n" +
    "                    <input ng-model=\"searchinput\" ng-model-options=\"{debounce: 400}\" ng-change=\"searchChange(searchinput)\" aria-label=\"Search\" placeholder=\"Search\"/>\r" +
    "\n" +
    "                </md-input-container>\r" +
    "\n" +
    "\r" +
    "\n" +
    "                <div class=\"ng-hide md-whiteframe-z2 filters\" layout=\"column\" ng-show=\"extended_search\">\r" +
    "\n" +
    "                    <div ng-repeat=\"filter in options.filters\" class=\"filter filter-{{filter.type}}\">\r" +
    "\n" +
    "                        \r" +
    "\n" +
    "                        <div class=\"label\">\r" +
    "\n" +
    "                            <label>{{filter.label}}</label> \r" +
    "\n" +
    "                        </div>\r" +
    "\n" +
    "\r" +
    "\n" +
    "                        <div class=\"interface\" ng-if=\"filter.type == 'select'\">\r" +
    "\n" +
    "\r" +
    "\n" +
    "                            <md-input-container class=\"md-block md-no-float\" ng-show=\"filter.multiple\">\r" +
    "\n" +
    "                                <md-select ng-model=\"filter.model\" aria-label=\"select\" multiple=\"filter.multiple\">\r" +
    "\n" +
    "                                    <md-option ng-repeat=\"item in filter.values\" value=\"{{item.value}}\">\r" +
    "\n" +
    "                                        {{item.name}}\r" +
    "\n" +
    "                                    </md-option>\r" +
    "\n" +
    "                                </md-select>\r" +
    "\n" +
    "                            </md-input-container>\r" +
    "\n" +
    "\r" +
    "\n" +
    "                            <md-input-container class=\"md-block md-no-float\" ng-show=\"!filter.multiple\">\r" +
    "\n" +
    "                                <md-select ng-model=\"filter.model\" aria-label=\"select\">\r" +
    "\n" +
    "                                    <md-option ng-repeat=\"item in filter.values\" value=\"{{item.value}}\">\r" +
    "\n" +
    "                                        {{item.name}}\r" +
    "\n" +
    "                                    </md-option>\r" +
    "\n" +
    "                                </md-select>\r" +
    "\n" +
    "                            </md-input-container>\r" +
    "\n" +
    "                        </div>\r" +
    "\n" +
    "\r" +
    "\n" +
    "                        <div class=\"interface \" ng-if=\"filter.type == 'text'\" >\r" +
    "\n" +
    "                            <md-input-container class=\"md-no-float md-block\">\r" +
    "\n" +
    "                                <input ng-model=\"filter.model\" aria-label=\"{{filter.label}}\" />\r" +
    "\n" +
    "                            </md-input-container>\r" +
    "\n" +
    "                        </div>\r" +
    "\n" +
    "                        \r" +
    "\n" +
    "                        <div class=\"interface\" ng-if=\"filter.type == 'range'\" >\r" +
    "\n" +
    "\r" +
    "\n" +
    "                            <span layout=\"row\" class=\"md-block\">\r" +
    "\n" +
    "                                 <md-input-container class=\"filter-range-min\">\r" +
    "\n" +
    "\r" +
    "\n" +
    "                                    <label>{{filter.label}}</label>\r" +
    "\n" +
    "\r" +
    "\n" +
    "                                    <input\r" +
    "\n" +
    "                                        placeholder=\"{{filter.placeholder[0]}}\"\r" +
    "\n" +
    "                                        ng-model=\"filter.model['min']\"\r" +
    "\n" +
    "                                        aria-label=\"{{filter.label}}\" />\r" +
    "\n" +
    "                                 </md-input-container>\r" +
    "\n" +
    "\r" +
    "\n" +
    "                                 <md-input-container class=\"filter-range-max\">\r" +
    "\n" +
    "\r" +
    "\n" +
    "                                    <label>{{filter.label}}</label>\r" +
    "\n" +
    "\r" +
    "\n" +
    "                                    <input\r" +
    "\n" +
    "                                        placeholder=\"{{filter.placeholder[1]}}\"\r" +
    "\n" +
    "                                        ng-model=\"filter.model['max']\"\r" +
    "\n" +
    "                                        aria-label=\"{{filter.label}}\" />\r" +
    "\n" +
    "                                 </md-input-container>\r" +
    "\n" +
    "                            </span>\r" +
    "\n" +
    "                        </div>\r" +
    "\n" +
    "\r" +
    "\n" +
    "                        <div class=\"interface\" ng-if=\"filter.type == 'date'\" >\r" +
    "\n" +
    "\r" +
    "\n" +
    "                            <span class=\"md-block\">                \r" +
    "\n" +
    "                                <md-datepicker-container>\r" +
    "\n" +
    "                                    <label>{{filter.label}}</label>\r" +
    "\n" +
    "                                    <md-datepicker ng-model=\"filter.model\"></md-datepicker>\r" +
    "\n" +
    "                                </md-datepicker-container>\r" +
    "\n" +
    "                            </span>\r" +
    "\n" +
    "                        </div>\r" +
    "\n" +
    "                    </div>\r" +
    "\n" +
    "\r" +
    "\n" +
    "                    <md-button class=\"md-button md-raised md-accent search-button\" ng-click=\"search()\">Search</md-button>\r" +
    "\n" +
    "                </div>\r" +
    "\n" +
    "            </div>\r" +
    "\n" +
    "            <md-button ng-click=\"toggleFilters()\" class=\"md-icon-button toggle-filters\" aria-label=\"Search filters\">\r" +
    "\n" +
    "                <md-icon>arrow_drop_down</md-icon>\r" +
    "\n" +
    "            </md-button>\r" +
    "\n" +
    "  \r" +
    "\n" +
    "            <div class=\"backdrop\" ng-show=\"extended_search\" ng-click=\"toggleFilters()\"></div>\r" +
    "\n" +
    "        </div>\r" +
    "\n" +
    "\r" +
    "\n" +
    "        <div ng-show=\"!options.inline\" class=\"ng-hide full-search\" flex=\"grow\">\r" +
    "\n" +
    "            <div ng-repeat=\"filters in groupedFilters\" layout=\"row\">\r" +
    "\n" +
    "                <div ng-repeat=\"filter in filters\" class=\"filter filter-{{filter.type}}\">\r" +
    "\n" +
    "                    <md-input-container ng-if=\"filter.type == 'select'\">\r" +
    "\n" +
    "                        <label>{{filter.label}}</label>\r" +
    "\n" +
    "                        <md-select ng-model=\"filter.model\" ng-change=\"filterChange(filter)\">\r" +
    "\n" +
    "                            <md-option ng-repeat=\"item in filter.values\" value=\"{{item.value}}\">\r" +
    "\n" +
    "                                {{item.name}}\r" +
    "\n" +
    "                            </md-option>\r" +
    "\n" +
    "                        </md-select>\r" +
    "\n" +
    "                    </md-input-container>\r" +
    "\n" +
    "                    <md-input-container class=\"md-input-has-placeholder\" ng-if=\"filter.type == 'text'\">\r" +
    "\n" +
    "                        <label>{{filter.label}}</label>\r" +
    "\n" +
    "                        <input ng-model=\"filter.model\" ng-model-options=\"{debounce: 300}\" ng-change=\"filterChange(filter)\" aria-label=\"{{filter.label}}\" />\r" +
    "\n" +
    "                    </md-input-container>\r" +
    "\n" +
    "                    <span ng-if=\"filter.type == 'range'\" layout=\"row\">\r" +
    "\n" +
    "                         <md-input-container class=\"filter-range-min\">\r" +
    "\n" +
    "\r" +
    "\n" +
    "                            <label>{{filter.label}}</label>\r" +
    "\n" +
    "\r" +
    "\n" +
    "                            <input\r" +
    "\n" +
    "                                placeholder=\"{{filter.placeholder[0]}}\"\r" +
    "\n" +
    "                                ng-model=\"filter.model['min']\"\r" +
    "\n" +
    "                                ng-model-options=\"{debounce: 300}\"\r" +
    "\n" +
    "                                ng-change=\"filterChange(filter)\"\r" +
    "\n" +
    "                                aria-label=\"{{filter.label}}\" />\r" +
    "\n" +
    "                         </md-input-container>\r" +
    "\n" +
    "\r" +
    "\n" +
    "                         <md-input-container class=\"filter-range-max\">\r" +
    "\n" +
    "\r" +
    "\n" +
    "                            <label>{{filter.label}}</label>\r" +
    "\n" +
    "\r" +
    "\n" +
    "                            <input\r" +
    "\n" +
    "                                placeholder=\"{{filter.placeholder[1]}}\"\r" +
    "\n" +
    "                                ng-model=\"filter.model['max']\"\r" +
    "\n" +
    "                                ng-model-options=\"{debounce: 300}\"\r" +
    "\n" +
    "                                ng-change=\"filterChange(filter)\"\r" +
    "\n" +
    "                                aria-label=\"{{filter.label}}\" />\r" +
    "\n" +
    "                         </md-input-container>\r" +
    "\n" +
    "                    </span>\r" +
    "\n" +
    "                    <span ng-if=\"filter.type == 'date'\">                \r" +
    "\n" +
    "                        <md-datepicker-container>\r" +
    "\n" +
    "                            <label>{{filter.label}}</label>\r" +
    "\n" +
    "                            <md-datepicker ng-model=\"filter.model\" ng-change=\"filterChange(filter)\"></md-datepicker>\r" +
    "\n" +
    "                        </md-datepicker-container>\r" +
    "\n" +
    "                    </span>\r" +
    "\n" +
    "                    <span ng-if=\"filter.type == 'newline'\">\r" +
    "\n" +
    "                        <br>\r" +
    "\n" +
    "                    </span>\r" +
    "\n" +
    "                </div>\r" +
    "\n" +
    "            </div>\r" +
    "\n" +
    "        </div>\r" +
    "\n" +
    "        <div class=\"top-actions\">\r" +
    "\n" +
    "            <md-button ng-repeat=\"action in topActions\" ng-show=\"!action.more\" ng-click=\"action.click($event)\" class=\"ng-hide md-raised\" ng-class=\"{ 'md-accent': action.primary!==false }\">{{action.label}}</md-button>\r" +
    "\n" +
    "            <md-menu ng-show=\"(topActions | filter:{ more: true }).length > 0\">\r" +
    "\n" +
    "                <md-button ng-click=\"$mdOpenMenu($event)\" class=\"md-icon-button more\">\r" +
    "\n" +
    "                    <md-icon>more_vert</md-icon>\r" +
    "\n" +
    "                </md-button>\r" +
    "\n" +
    "                <md-menu-content>\r" +
    "\n" +
    "                    <md-menu-item ng-repeat=\"action in topActions\" ng-show=\"action.more\">\r" +
    "\n" +
    "                        <md-button ng-click=\"action.click($event)\">\r" +
    "\n" +
    "                            <md-icon ng-show=\"action.icon\">{{action.icon}}</md-icon>\r" +
    "\n" +
    "                            {{action.label}}\r" +
    "\n" +
    "                        </md-button>\r" +
    "\n" +
    "                    </md-menu-item>\r" +
    "\n" +
    "                </md-menu-content>\r" +
    "\n" +
    "            </md-menu>\r" +
    "\n" +
    "        </div>\r" +
    "\n" +
    "    </div>\r" +
    "\n" +
    "    <div ng-show=\"options.paging.infinite && numeric(paging.records)\" class=\"infinite-records ng-hide\">{{paging.records}} Records</div>\r" +
    "\n" +
    "    <div class=\"results\">\r" +
    "\n" +
    "        <div class=\"lister-table\">\r" +
    "\n" +
    "            <div class=\"lister-head\">\r" +
    "\n" +
    "                <div class=\"lister-row\">\r" +
    "\n" +
    "                    <div class=\"lister-col lister-select-toogle\" ng-show=\"options.selection\">\r" +
    "\n" +
    "                        <span ng-show=\"data.length\">\r" +
    "\n" +
    "                            <md-checkbox ng-click=\"selectionsToggle(selectToogled);\" ng-model=\"selectToogled\"  ng-true-value=\"true\" aria-label=\"Toggle Selection\" class=\"select-checkbox\"></md-checkbox>\r" +
    "\n" +
    "                            <md-menu md-offset=\"17 42\">\r" +
    "\n" +
    "                                <md-button aria-label=\"Select\" class=\"md-icon-button\" ng-click=\"$mdOpenMenu($event)\">\r" +
    "\n" +
    "                                    <md-icon>arrow_drop_down</md-icon>\r" +
    "\n" +
    "                                </md-button>\r" +
    "\n" +
    "                                <md-menu-content>\r" +
    "\n" +
    "                                    <md-menu-item ng-repeat=\"action in options.selection.actions\">\r" +
    "\n" +
    "                                        <md-button ng-click=\"selectMenu(action.click,$event)\">\r" +
    "\n" +
    "                                            <md-icon md-menu-align-target ng-show=\"action.icon\">{{action.icon}}</md-icon>\r" +
    "\n" +
    "                                            {{action.label}}\r" +
    "\n" +
    "                                        </md-button>\r" +
    "\n" +
    "                                    </md-menu-item>\r" +
    "\n" +
    "                                </md-menu-content>\r" +
    "\n" +
    "                            </md-menu>\r" +
    "\n" +
    "                        </span>\r" +
    "\n" +
    "                    </div>\r" +
    "\n" +
    "                    <div class=\"lister-col {{col.className}}\" ng-repeat=\"col in options.columns\" fs-lister-compile=\"col.title\" fs-column=\"col\" ng-style=\"columnStyle(col)\"></div>\r" +
    "\n" +
    "                    <div class=\"lister-col\" ng-show=\"options.actions.length || options.action\"></div>\r" +
    "\n" +
    "                </div>\r" +
    "\n" +
    "            </div>\r" +
    "\n" +
    "            <div class=\"lister-body\">\r" +
    "\n" +
    "                <div class=\"progress-paged ng-hide\" ng-show=\"loading && !options.paging.infinite\">\r" +
    "\n" +
    "                    <md-progress-circular md-mode=\"indeterminate\"></md-progress-circular>\r" +
    "\n" +
    "                </div>\r" +
    "\n" +
    "                <div class=\"lister-row\" ng-class=\"{ selected: checked[rowIndex] }\" ng-repeat=\"item in data\" ng-click=\"options.rowClick(item.object,$event); $event.stopPropagation();\" ng-init=\"rowIndex = $index\">\r" +
    "\n" +
    "                    <div class=\"lister-col\" ng-show=\"options.selection\">\r" +
    "\n" +
    "                        <md-checkbox ng-model=\"checked[rowIndex]\" ng-true-value=\"1\" ng-click=\"select(item)\" aria-label=\"Select\" class=\"select-checkbox\"></md-checkbox>\r" +
    "\n" +
    "                    </div>\r" +
    "\n" +
    "                    <div class=\"lister-col {{col.column.className}}\" ng-repeat=\"col in item.cols\" fs-lister-compile=\"col.value\" fs-column=\"col.column\" fs-data=\"item.object\" ng-style=\"columnStyle(col.column)\"></div>\r" +
    "\n" +
    "                    <div class=\"lister-col lister-actions\" ng-if=\"options.action\">\r" +
    "\n" +
    "                        <md-button ng-click=\"actionClick(options.action,item,$event); $event.stopPropagation();\" class=\"md-icon-button\">\r" +
    "\n" +
    "                            <md-icon md-font-set=\"material-icons\" class=\"md-default-theme material-icons\">{{options.action.icon}}</md-icon>\r" +
    "\n" +
    "                        </md-button>\r" +
    "\n" +
    "                    </div>\r" +
    "\n" +
    "                    <div class=\"lister-col lister-actions\" ng-if=\"options.actions.length\">\r" +
    "\n" +
    "                        <md-menu>\r" +
    "\n" +
    "                            <md-button ng-click=\"$mdOpenMenu($event)\" class=\"md-icon-button\">\r" +
    "\n" +
    "                                <md-icon md-font-set=\"material-icons\" class=\"md-default-theme material-icons\">more_vert</md-icon>\r" +
    "\n" +
    "                            </md-button>\r" +
    "\n" +
    "                            <md-menu-content>\r" +
    "\n" +
    "                                <md-menu-item ng-if=\"action.show(item.object)\" ng-repeat=\"action in options.actions\">\r" +
    "\n" +
    "                                    <md-button ng-click=\"actionClick(action,item,$event)\">\r" +
    "\n" +
    "                                        <md-icon md-font-set=\"material-icons\" class=\"md-default-theme material-icons\" ng-show=\"action.icon\">{{action.icon}}</md-icon>\r" +
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
    "                    </div>\r" +
    "\n" +
    "                </div>\r" +
    "\n" +
    "            </div>\r" +
    "\n" +
    "        </div>\r" +
    "\n" +
    "        <div class=\"status\">\r" +
    "\n" +
    "            <div class=\"norecords ng-hide\" ng-show=\"!loading && options.norecords && !data.length\">{{options.norecords}}</div>\r" +
    "\n" +
    "            <div class=\"progress-infinite ng-hide\" ng-show=\"loading && options.paging.infinite\">\r" +
    "\n" +
    "                <md-progress-circular md-mode=\"indeterminate\"></md-progress-circular>\r" +
    "\n" +
    "            </div>\r" +
    "\n" +
    "        </div>\r" +
    "\n" +
    "    </div>\r" +
    "\n" +
    "    <div class=\"paging ng-hide\" ng-show=\"paging.enabled && !options.paging.infinite\" layout=\"row\">\r" +
    "\n" +
    "        <div class=\"records\">\r" +
    "\n" +
    "            <label>Total</label>\r" +
    "\n" +
    "            <div>{{paging.records}} Records</div>\r" +
    "\n" +
    "        </div>\r" +
    "\n" +
    "        <div flex>\r" +
    "\n" +
    "            <ul class=\"pages\" ng-if=\"paging.pages>1\">\r" +
    "\n" +
    "                <li ng-class=\"{ disabled : paging.page == 1 }\">\r" +
    "\n" +
    "                    <a href=\"javascript:;\" ng-click=\"page(1)\">&laquo;</a>\r" +
    "\n" +
    "                </li>\r" +
    "\n" +
    "                <li ng-class=\"{ disabled : paging.page == 1 }\" class=\"ng-scope\">\r" +
    "\n" +
    "                    <a href=\"\" ng-click=\"page(paging.page - 1)\" class=\"ng-binding\">‹</a>\r" +
    "\n" +
    "                </li>\r" +
    "\n" +
    "                <li ng-repeat=\"number in [] | listerRange:paging.pages:paging.page\" ng-class=\"{ active : paging.page == (number + 1), disabled : number == '...' }\">\r" +
    "\n" +
    "                    <a href=\"\" ng-click=\"page(number + 1)\">{{ number + 1}}</a>\r" +
    "\n" +
    "                </li>\r" +
    "\n" +
    "                <li ng-class=\"{ disabled : paging.page == paging.pages }\" class=\"ng-scope\">\r" +
    "\n" +
    "                    <a href=\"\" ng-click=\"page(paging.page + 1)\" class=\"ng-binding\">›</a>\r" +
    "\n" +
    "                </li>\r" +
    "\n" +
    "                <li ng-class=\"{ disabled : paging.page == paging.pages }\">\r" +
    "\n" +
    "                    <a href=\"\" ng-click=\"page(paging.pages)\">&raquo;</a>\r" +
    "\n" +
    "                </li>\r" +
    "\n" +
    "            </ul>\r" +
    "\n" +
    "        </div>\r" +
    "\n" +
    "        <div class=\"limits\">\r" +
    "\n" +
    "            <md-input-container>\r" +
    "\n" +
    "                <label>Show</label>\r" +
    "\n" +
    "                <md-select ng-model=\"paging.limit\" md-on-close=\"load()\">\r" +
    "\n" +
    "                    <md-option ng-repeat=\"limit in options.paging.limits\" value=\"{{limit}}\">\r" +
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
    "    </div>\r" +
    "\n" +
    "</div>\r" +
    "\n"
  );

}]);
