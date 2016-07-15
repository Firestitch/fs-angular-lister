(function () {
    'use strict';
    
    /**
     * @ngdoc directive
     * @name app.directives:fs-lister
     * @restrict E
     * @param {object} ls-options Options to configure the Lister.
     * @param {function} ls-options.data When the load() function is called this data function is called with two parameters query and callback. 
                <ul>
                    <li><label>query</label> An object with the filters</li>
                    <li><label>callback</label>Call back function to populate lister dataset and paging</li>
                    <ul>
                        <li><label>data</label> An array of objects to populate the lister</li>
                        <li><label>paging</label> Paging object</li>
                        <ul>
                            <li><label>records</label> The number of records in the entire dataset (before any paging).</li>
                            <li><label>limit</label> The number of records for paging</li>
                            <li><label>page</label> The page number starting at one</li>
                            <li><label>pages</label> The total number of pages in the entire dataset</li>
                        </ul>
                    </ul>
                </ul>  
     * @param {function} ls-options.rowClick Called when the row is clicked
     * @param {array} ls-options.actions Adds a column to the right side of the lister and places a button that a user can click to perform custom events
                <ul>
                    <li><label>label</label>Used in the contextual menu item's label</li>
                    <li><label>click</label>Is triggered when the contextual menu item is clicked</li>
                    <li><label>icon</label>Used in the contextual menu item icon</li>
                    <li><label>delete</label> Used for delete confirmation. </li>
                    <ul>
                        <li><label>title</label> Title of confirmation. Default 'Confirm'.</li>
                        <li><label>content</label> Content of confirmation.</li>
                        <li><label>ok</label> Function when ok is clicked.</li>
                        <li><label>cancel</label> Function when cancel is clicked.</li>
                        <li><label>okLabel</label> Ok label. Default 'Ok'.</li>
                        <li><label>cancelLabel</label> Cancel label. Default 'Cancel'</li>
                    </ul>
                </ul>
    * @param {object} ls-options.action Simular to ls-options.actions but directly places the icon in the row instead of having the multiple option.
    * @param {bool} ls-options.load Loads the lister data on directive load. Default true
    * @param {object} ls-options.paging Configures paging
                <ul>
                    <li><label>infinite</label>Enables infinite scroll</li>
                    <li><label>limit</label>Sets the limit per page</li>
                </ul>
    * @param {object} ls-options.norecords The message to be displayed when there are no records in the search
    * @param {object} ls-options.selection Enables the checkbox selection interface found on the left side
                <ul>
                    <li><label>actions[]</label> Sets the menus options for the selection interface</li>
                    <ul>
                        <li><label>label</label>Used in the contextual menu item's label</li>
                        <li><label>click</label>Is triggered when the contextual menu item is clicked. First param an array of selected objects and the second param is the $event</li>
                        <li><label>icon</label>Used in the contextual menu item icon</li>
                    </ul>
                </ul>        
    * @param {array} ls-options.columns Defines the columns for the lister
                <ul>
                    <li><label>title</label>Specifies the column tile</li>
                    <li><label>value</label>Is triggered when the rendering the column and is passed a data parameter which corresponds to the row's record</li>
                    <li><label>className</label>A css class name that is appened to the column element</li>
                    <li><label>resolve</label>Used to inject objects in the value() function and inserts the values into the $scope variable</li>
                    <li><label>scope</label>Appended to the $scope object which is injected into the value() function</li>
                </ul>
     * @param {array} ls-options.filters Defines the filters found above the lister table
                <ul>
                    <li><label>name</label>the name in the query object passed to the fetch data process</li>
                    <li><label>type</label>select (single selection dropdown) or text (one line input box) or date</li>
                    <li><label>label</label>The label of the interface</li>
                    <li><label>values</label>An key/value paired object with a list of filterable values. To avoid specifying a filter value use the key '__all'.  Applies only ror select type filters.</li>
                    <li><label>default</label>Sets the default filter value</li>
                </ul>
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
    
    var ListerDirective = [ '$compile', '$sce', '$filter', '$window', '$log', '$q', '$timeout', '$mdDialog', 
                            'fsStore', '$rootScope', 'fsLister', '$location', '$templateCache',
                            function ($compile, $sce, $filter, $window, $log, $q, $timeout, $mdDialog, 
                                    fsStore, $rootScope, fsLister, $location, $templateCache) {            
        return {
            template: function(element, attr) {
                var template = $templateCache.get('views/directives/lister.html');

                var sort = angular.element(element).attr('ls-sort');

                if(sort===undefined) {
                    template = template
                                .replace(/sv-root[^\s\>]*/,'')
                                .replace(/sv-on-stop[^\s\>]*/,'')
                                .replace(/sv-part[^\s\>]*/,'')
                                .replace(/sv-handle[^\s\>]*/,'')
                                .replace(/sv-element[^\s\>]*/,'');
                }

                return template;
            },
            restrict: 'E',            
            scope: {
                lsOptions: '=',
                lsInstance: '='
            },
            controller: function ($scope) {

                var options     = angular.extend({},fsLister.options(),$scope.lsOptions);                
                var dataIndex   = 0;                
                var persists    = fsStore.get('lister-persist',{});

                if(options.paging===false)
                    options.paging = { enabled: false };

                options.paging = options.paging || {};
                options.paging.enabled = options.paging.enabled===undefined ? true : options.paging.enabled;
                options.paging.pages = options.paging.pages===undefined ? true : options.paging.pages;
                options.paging.limits = options.paging.limits ? options.paging.limits : [5, 10, 25, 50, 100];
                options.paging.limit = options.paging.limit ? options.paging.limit : options.paging.limits[0];
                options.norecords = options.norecords===undefined ? 'No records found' : options.norecords;
                options.load = options.load===undefined ? true : options.load;
                options.actions = options.actions || [];
                options.filters = options.filters || [];

                if(options.persist) {

                    if(!angular.isObject(options.persist)) {
                        options.persist = {};
                    }

                    if(!options.persist.name) {
                        options.persist.name = $location.$$path;
                    }

                    if(!persists[options.persist.name] || !persists[options.persist.name]['data']) {
                        persists[options.persist.name] = { data: {}, date: new Date() };
                    }

                    if(options.persist.timeout) {

                        var date = new Date(persists[options.persist.name]['date']);

                        if(moment(date).subtract(options.persist.timeout,'minutes').isAfter(moment())) {
                            persists[options.persist.name] = { data: {}, date: new Date() };
                        }
                    }
                }

                $scope.data = [];
                $scope.dataCols = [];
                $scope.styleCols = [];
                $scope.options = options;
                $scope.paging = { records: 0, page: 1, pages: 0 };
                $scope.loading = false;
                $scope.checked = [];
                $scope.selectToogled = false;
                $scope.debug = false;
                $scope.load = load;
                $scope.reload = reload;
                $scope.page = page;
                $scope.numeric = numeric;
                $scope.extended_search = false;
                $scope.searchinput = { value: '' };
                $scope.paged = null;

                var primary = false;
                angular.forEach(options.filters,function(filter) {

                    if(filter.primary) {
                        primary = true;
                    } else {
                        filter.primary = false;
                    }

                    filter.model = filter.default;

                    if(options.persist) {

                        var persisted = persists[options.persist.name]['data'];

                        if(persisted[filter.name]!==undefined) {

                            filter.model = persisted[filter.name];

                            if(filter.type=='date') {
                                filter.model = new Date(filter.model);
                            }
                        }
                    }

                    if(filter.param) {
                        var search = $location.search();

                        if(search[filter.param]) {
                            filter.model = search[filter.param];
                        }
                    }  

                    if(!filter.model) {                 

                        if(filter.type=='date') {
                            
                            if(typeof filter.model == 'string') {
                                filter.model = new Date(filter.model);
                            }
                        }

                        if(filter.type=='checkbox') {
                            filter.model = filter.unchecked;
                        }

                        if(filter.type=='select') {

                            if(filter.multiple) {
                                if(!angular.isArray(filter.default)) {
                                    filter.model = [];
                                }
                            } else {
                                if(filter.default==undefined) {
                                    filter.model = '__all';
                                }
                            }
                        }
                    }

                    if(filter.type=='range' && !filter.placeholder) {
                        filter.placeholder = ['Min','Max'];
                    }

                    if(!primary && filter.type=='text') {
                        filter.primary = primary = true;
                    }

                     if(filter.type=='select' && filter.isolate && filter.isolate.value==filter.model) {
                        filter.isolate.enabled = true;
                    }
                });

                angular.forEach(options.columns,function(col,index) {

                    $scope.styleCols[index] = columnStyle(col);

                    if(col.order) {
                        if(angular.isString(col.order)) {
                            col.order = { name: col.order };
                        }

                        if(!col.order.direction) { 
                            col.order.direction = 'asc';
                        }

                        if(col.order.default) {
                            $scope.order = angular.copy(col.order);
                        }
                    }
                });

                angular.forEach(options.columns,function(col) {

                    if(!$scope.order && col.order) {
                        $scope.order = angular.copy(col.order);
                    }
                });

                sanitizeAction(options.action);
                angular.forEach(options.actions,function(action) {
                    sanitizeAction(action);
                });
                
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

                $scope.headerClick = function(col) {

                    if(col.order) {

                        if($scope.order.name==col.order.name) {
                            $scope.order.direction = $scope.order.direction=='asc' ? 'desc' : 'asc';
                        } else {
                            $scope.order.direction = col.order.direction;
                        }

                        $scope.order.name = col.order.name;

                        reload();
                    }
                }

                $scope.actionsShow = function(data) {

                    var show = false;
                    angular.forEach($scope.options.actions,function(action) {
                        if(action.show(data)) {
                            show = true;
                        }
                    });

                    return show;
                }

                $scope.sortStop = function(item,partTo,indexFrom,indexTo) {

                    var list = [];
                    angular.forEach(partTo,function(object) {
                        list.push(object);
                    });

                    $scope.options.sort.stop(item,list,indexFrom,indexTo);
                }
                
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
                                                    var result = action.delete.ok(item, event, helper);

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
                                                    action.delete.cancel(item, event, helper);
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
                        action.click(item, event, helper);
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
                            selected.push($scope.data[index]);
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

                $scope.openFilters = function() {
                    $scope.extended_search = true;
                }

                $scope.done = function() {
                    $scope.extended_search = false;
                }

                $scope.selectSearch = function(filter) {
                   
                    if(filter.isolate) {
                        filter.isolate.enabled = false;
                    }
                    
                    $scope.search();
                }

                $scope.dateSearch = function(filter) {
                    $scope.search();
                }
                
                $scope.isolateSearch = function(filter) {

                    if(filter.isolate.enabled) {
                        filter.model = filter.multiple ? [filter.isolate.value] : filter.isolate.value;
                    } else {
                        filter.model = null;
                    }
                    
                    $scope.search();
                }

                $scope.search = function() {

                    angular.forEach(options.filters,function(filter) {
                        $scope.filterValue(filter);
                    });

                    $scope.searchInputUpdate();
                    reload();
                }

                $scope.searchInputUpdate = function() {

                    var searches = [];
                    angular.forEach(options.filters,function(filter) {

                        var value = filter.value;
                        if(value!==null) {

                            if(filter.type=='select') {

                                if(filter.isolate && filter.isolate.enabled) {
                                    value = filter.isolate.label;

                                } else {

                                    if(filter.multiple) {

                                        if(!value) {
                                            return;
                                        }

                                        var values = [];
                                        angular.forEach(value.split(','),function(item) {
                                            angular.forEach(filter.values,function(filter_item) {
                                                if(!String(filter_item.value).localeCompare(String(item))) {
                                                    values.push(filter_item.name);
                                                }
                                            });
                                        });

                                        value = values.join(',');

                                    } else {
                                        
                                        angular.forEach(filter.values,function(filter_item) {
                                            if(!String(filter_item.value).localeCompare(String(value))) {
                                                value = filter_item.name;
                                            }
                                        });
                                    }
                                }

                            } else if(filter.type=='date') {

                                var matches = value.match(/(\d{4}-\d{2}-\d{2})/);
                                value = matches[1];
                            
                            } else if(filter.type=='checkbox') {

                                if(filter.model==filter.unchecked) {
                                    return;
                                } else {
                                    value = 'Yes';
                                }
                            }

                            value = String(value);

                            if (filter.alias) {
                                var label = filter.alias.match(/\s/) ? '(' + filter.alias + ')' : filter.alias;
                            } else {
                                var label = filter.label.match(/\s/) ? '(' + filter.label + ')' : filter.label;
                            }
                            
                            var value = value.match(/\s/) ? '(' + value + ')' : value;

                            searches.push(label + ':' + value);
                        }
                    });

                    $scope.searchinput = { value: searches.join(' ') };
                }
                $scope.searchKeydown = function(event, operation)  {
                    var operation = operation || 'open';

                    if (operation=='open') {
                        $scope.extended_search = (event.keyCode==40) ? true : false;
                    } else if(operation=='closePopupOnEnter') {
                        $scope.extended_search = (event.keyCode==13) ? false : true;
                    }
                };

                $scope.searchChange = function(search) {

                    var matches = search.match(/(\([^\)]+\):[^\s]+|\([^\)]+\):\([^\)]+\)|[^:]+:\([^\)]+\)|[^\s]+)/g);

                    var values = {};
                    angular.forEach(matches, function(match) {

                        var filter_match = match.match(/\(?([^:\)]+)\)?:\(?([^)]+)/);

                        if(filter_match) {
                            values[filter_match[1]] = filter_match[2];
                        }
                    });

                    angular.forEach(options.filters,function(filter) {
                        if (filter.type == 'checkbox') {
                            filter.model = filter.unchecked;
                            filter.value = filter.unchecked;
                        } else {
                            filter.model = null;
                        }
                        $scope.filterValue(filter);
                    });
                    
                    angular.forEach(values,function(value, label) {
                        
                        var filter = $filter('filteri')(options.filters,{ label: label },true)[0];

                        if(filter) {                           
                           
                            if(filter.type=='date') {

                                filter.model = new Date(value);

                                if(value.match(/(\d{4}-\d{2}-\d{2})/)) {
                                    filter.model = new Date(filter.model.getTime() + (filter.model.getTimezoneOffset() * 60000));
                                }

                            } else if(filter.type=='range') {
                                var parts = value.split(',');
                                filter.model = { min: parts[0], max: parts[1] };
                            
                            } else if(filter.type=='select') {

                                if(filter.multiple) {

                                    var values = [];
                                    angular.forEach(value.split(','),function(value) {

                                        var item = $filter('filteri')(filter.values,{ name: value },true)[0];

                                        if(item) {
                                            values.push(item.value);
                                        }
                                    });

                                    filter.model = values;
                                
                                } else {

                                    var item = $filter('filteri')(filter.values,{ name: value },true)[0];

                                    if(item) {
                                       filter.model = item.value; 
                                    }
                                }

                            } else if(filter.type=='checkbox') {
                                filter.model = (value == 'Yes') ? filter.checked  : filter.unchecked;
                            } else {
                                filter.model = value;
                            }

                            $scope.filterValue(filter);
                        }
                    });

                    if(!Object.keys(values).length) {

                        angular.forEach(options.filters,function(filter) {
                            filter.model = null;
                            if(filter.primary) {
                                filter.model = search;
                                $scope.filterValue(filter);
                            }
                        });
                    }

                    reload();
                 }

                $scope.filterValue = function(filter) {

                    filter.value = null;

                    if(filter.type=='select') {

                        if(filter.isolate && filter.isolate.enabled) {
                            filter.value = filter.isolate.value;
                        } else {

                            if(filter.multiple) {

                                if(angular.isArray(filter.model)) {
                                    filter.value = filter.model.join(',');
                                }

                            } else if(filter.model!='__all')  {
                                filter.value = filter.model;
                            }
                        }

                    } else if(filter.type=='date') {

                        var date = filter.model;

                        if(date) {

                            if(filter.time===undefined || filter.time) {
                                filter.value = moment(date).utc().format();
                            } else {
                                filter.value = moment(date).utc().add(moment(filter.model).utcOffset(), 'm').format();
                            }
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

                function columnStyle(col) {
                    var styles = {};

                    if(col.width) {
                        styles.width = col.width;
                    }

                    if(col.center) {
                        styles.textAlign = 'center';
                    }

                    return styles;
                }

                function reload() {
                    load({ page: 1, clear: true });
                }

                function sanitizeAction(action) {
                    action = action || {};

                    if(action.delete) {
                        action.label = (action.label !== undefined) ?  action.label : 'Remove';
                        action.icon = (action.icon !== undefined) ? action.icon  : 'delete';
                    }
                    
                    if(!action.show) {
                        action.show = function() { return true }
                    }
                    
                    return action;
                }

                function filterValues() {
                    var query = {};
                    angular.forEach(options.filters,function(filter) {
                        
                        if(filter.value!==null && String(filter.value).length) {
                            query[filter.name] = filter.value;
                        }
                    });

                    return query;
                }

                function clearData() {
                    dataIndex = 0;
                    $scope.data = [];                    
                    $scope.dataCols = [];
                }

                function load(opts) {

                    if($scope.loading)
                        return;

                    opts = opts || {};

                    if(opts.clear===true) {
                        $scope.paged = null;
                    }

                    if($scope.options.paging.infinite && $scope.paged) {
                        if($scope.paged.records <= ($scope.paged.limit * $scope.paged.page)) {
                            return;
                        }
                    }
                    
                    if(opts.page) {

                        if(opts.clear) {
                            opts.page = 1;
                            if($scope.options.paging.infinite) {
                               clearData();
                            }
                        }

                        $scope.paging.page = opts.page;
                    }

                    $scope.selectionsClear();          

                    var query = filterValues();

                    if(options.persist) {

                        var models = {};
                        angular.forEach(options.filters,function(filter) {
                            models[filter.name] = filter.model;
                        });

                        persists[options.persist.name] = { data: models, date: new Date() };
                    }

                    if($scope.options.paging.enabled) {
                        if($scope.paging.page!==undefined) {
                            query.page = $scope.paging.page;
                        }

                        if($scope.options.paging.limit!==undefined) {
                            query.limit = $scope.options.paging.limit;
                        }
                    }

                    if($scope.order) {
                        query.order = $scope.order.name + ',' + $scope.order.direction;
                    }

                    log("Calling data()", query);
                    
                    var dataCallback = function(data, paging) {
                        if(opts.clear) {
                            $scope.max_bottom = 0;
                            clearData();
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

                function callback(objects, paging) {
                    
                    log("dataCallback()",objects,paging);

                    if(!$scope.options.paging.infinite) {
                        clearData();
                    }

                    var ol = objects.length;
                    for (var o = 0; o < ol; o++) { 

                        var cl = options.columns.length;
                        var cols = [];

                        for (var c = 0; c < cl; c++) {
                        
                            var col = options.columns[c];
                            var value = col.value;

                            if(typeof col.value =='function') {
                                value = col.value(objects[o]);
                            }

                            cols[c] = value;
                        }

                        $scope.dataCols[dataIndex] = cols;

                        objects[o].$$index = dataIndex;
                        $scope.data.push(objects[o]);

                        dataIndex++;
                    }    
                    
                    $scope.paging.records = null;

                    if(paging) {

                        if(paging.records===null) {
                            $scope.options.paging.enabled = false;
                        }

                        $scope.paging.records = paging.records;
                        $scope.paging.pages = paging.pages;
                        
                        if(paging.limit) {
                            $scope.options.paging.limit = paging.limit;
                            //options.limit = paging.limit;
                        }
                    
                    } else {
                        $scope.options.paging.enabled = false;
                    }

                    $scope.paged = paging;

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

                    if(filter.isolate) {
                        angular.forEach(filter.values,function(item, index) {

                            if(item.value==filter.isolate.value) {
                                filter.values.splice(index,1);
                            }
                        });
                    }
                           
                    $scope.filterValue(filter);
                });

                $scope.searchInputUpdate();

                if(options.load) {
                    reload();
                }

                function data() {

                    if(!arguments.length)
                        return $scope.data;

                    $scope.data = arguments[0];

                    return this;
                }

                if($scope.lsInstance) {
                    angular.extend($scope.lsInstance,{ load: load, page: page, reload: reload , filterValues: filterValues, data: data });
                }
            },
            compile: function(element, tAttrs, s, d) {


                return {

                    post: function($scope, element, attr, ctrl) {               
                       
                        var widthHolders = function() {                    

                            if(!$scope.loading) {

                                var elements = document.getElementsByClassName('lister-col-header');

                                angular.forEach(elements,function(col) {

                                    angular.forEach(col.childNodes,function(element) {
                                        if(angular.element(element).hasClass('width-holder')) {

                                            var style = window.getComputedStyle(col);
                                            element.style.width = (col.clientWidth - parseInt(style.paddingLeft, 10) - parseInt(style.paddingRight, 10)) + 'px';
                                        }
                                    });
                                }); 
                            }

                            $timeout(widthHolders,2500);
                        }

                        widthHolders();

                        $scope.max_bottom = 0;
                        if($scope.lsOptions && $scope.lsOptions.paging && $scope.lsOptions.paging.infinite) {

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
        }
    }];

    angular.module('fs-angular-lister',['fs-angular-store','angular-sortable-view'])
    .directive('lister',ListerDirective)
    .directive('fsLister',ListerDirective)
    .directive('fsListerCompile', ['$compile', '$injector', '$location', '$timeout', '$rootScope', 
                                    function ($compile, $injector, $location, $timeout, $rootScope) {        
        return {    scope: {
                        column: '=fsColumn',
                        data: '=fsData',
                        value: '=fsListerCompile'
                    },
                    link: function($scope, element, attrs, ctrl) {

                        var scope = $scope;

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
                       
                        var elements = element.find('a');
                        for(var i=0;i<elements.length;i++) {

                            angular.element(elements[i]).on('click',function(event) {

                                var el = angular.element(this);
                                
                                if(event.isDefaultPrevented() || el.attr('href').match(/^http/)) {
                                    return;
                                }
                                
                                if (!$location.$$html5 || event.metaKey || event.shiftKey || event.which == 2 || event.button == 2) return;                                

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
                        }
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

    .filter('filteri', function() {
      return function(list, filters) {

        var result = [];        
        angular.forEach(list,function(value,key) {

            var valid = true;
            angular.forEach(filters,function(fvalue,fkey) {
                if (value['alias']) {
                    valid = String(fvalue).toLowerCase()===String(value['alias']).toLowerCase();
                } else {
                    valid = String(fvalue).toLowerCase()===String(value[fkey]).toLowerCase();
                }
            });
            
            if(valid) {
                result.push(value);
            }
        });
        return result;
      };
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
    "<div class=\"lister\" ng-class=\"{ loading: loading, infinite: options.paging.infinite, paged: !options.paging.infinite }\">\n" +
    "\n" +
    "    <div layout=\"row\" layout-align=\"start\" class=\"lister-search\" ng-if=\"options.filters.length || options.topActions.length\" layout-align=\" end\">\n" +
    "        <div ng-if=\"options.inline\" layout=\"row\" layout-align=\"start center\" class=\"inline-search\" flex>\n" +
    "            <div class=\"inline-search-input\" flex=\"grow\">\n" +
    "                <div class=\"main-search-bar\" layout=\"row\" layout-align=\"start center\">\n" +
    "\n" +
    "                    <div ng-click=\"reload()\" class=\"search-reload\"><i class=\"material-icons reload\">refresh</i><i class=\"material-icons search\">search</i></div>\n" +
    "                    <md-input-container class=\"md-short-container\" md-no-float>\n" +
    "                        <input ng-model=\"searchinput.value\" ng-model-options=\"{debounce: 400}\" ng-change=\"searchChange(searchinput.value)\" ng-click=\"openFilters()\" ng-keydown=\"searchKeydown($event)\" aria-label=\"Search\" placeholder=\"Search\" autocomplete=\"off\" />\n" +
    "                    </md-input-container>\n" +
    "                </div>\n" +
    "\n" +
    "                <div class=\"ng-hide filters\" layout=\"column\" ng-show=\"extended_search\">\n" +
    "                    <div class=\"wrap\">\n" +
    "                        <div ng-repeat=\"filter in options.filters\" class=\"filter-group\">\n" +
    "                            \n" +
    "                            <div class=\"filter filter-{{filter.type}}\">\n" +
    "\n" +
    "                                <div class=\"filter-label\">\n" +
    "                                    <div class=\"filter-label-content\">\n" +
    "                                        {{::filter.label}}\n" +
    "                                    </div>\n" +
    "                                </div>\n" +
    "\n" +
    "                                <div class=\"interface\" ng-if=\"filter.type == 'select'\">\n" +
    "\n" +
    "                                    <md-input-container class=\"md-no-label md-no-message md-block md-no-float\" ng-if=\"filter.multiple\">\n" +
    "                                        <md-select ng-model=\"filter.model\" aria-label=\"select\" multiple=\"filter.multiple\" md-on-close=\"selectSearch(filter)\">\n" +
    "                                            <md-option ng-repeat=\"item in filter.values\" value=\"{{::item.value}}\">\n" +
    "                                                {{::item.name}}\n" +
    "                                            </md-option>\n" +
    "                                        </md-select>\n" +
    "                                    </md-input-container>\n" +
    "\n" +
    "                                    <md-input-container class=\"md-no-label md-no-message md-block md-no-float\" ng-if=\"!filter.multiple\">\n" +
    "                                        <md-select ng-model=\"filter.model\" aria-label=\"select\" ng-change=\"selectSearch(filter)\">\n" +
    "                                            <md-option ng-repeat=\"item in filter.values\" value=\"{{::item.value}}\">\n" +
    "                                                {{::item.name}}\n" +
    "                                            </md-option>\n" +
    "                                        </md-select>\n" +
    "                                    </md-input-container>\n" +
    "\n" +
    "                                </div>\n" +
    "\n" +
    "                                <div class=\"interface \" ng-if=\"filter.type == 'text'\">\n" +
    "                                    <md-input-container class=\"md-no-label md-no-message md-block md-no-float\">\n" +
    "                                        <input ng-model=\"filter.model\" aria-label=\"{{::filter.label}}\" ng-model-options=\"{debounce: 400}\" ng-keydown=\"searchKeydown($event, 'closePopupOnEnter')\" ng-change=\"search()\"/>\n" +
    "                                    </md-input-container>\n" +
    "                                </div>\n" +
    "                                \n" +
    "                                <div class=\"interface\" ng-if=\"filter.type == 'range'\" >\n" +
    "\n" +
    "                                    <span layout=\"row\" class=\"md-block\">\n" +
    "                                         <md-input-container class=\"md-no-label md-no-message md-block filter-range-min\">\n" +
    "\n" +
    "                                            <label>{{::filter.label}}</label>\n" +
    "                                            <input\n" +
    "                                                placeholder=\"{{::filter.placeholder[0]}}\"\n" +
    "                                                ng-model=\"filter.model['min']\"\n" +
    "                                                aria-label=\"{{::filter.label}}\"\n" +
    "                                                ng-model-options=\"{debounce: 400}\"\n" +
    "                                                ng-change=\"search()\" />\n" +
    "                                         </md-input-container>\n" +
    "\n" +
    "                                         <md-input-container class=\"md-no-label md-no-message md-block filter-range-max\">\n" +
    "\n" +
    "                                            <label>{{::filter.label}}</label>\n" +
    "                                            <input\n" +
    "                                                placeholder=\"{{::filter.placeholder[1]}}\"\n" +
    "                                                ng-model=\"filter.model['max']\"\n" +
    "                                                aria-label=\"{{::filter.label}}\"\n" +
    "                                                ng-model-options=\"{debounce: 400}\"\n" +
    "                                                ng-change=\"search()\" />\n" +
    "                                         </md-input-container>\n" +
    "                                    </span>\n" +
    "                                </div>\n" +
    "\n" +
    "                                <div class=\"interface\" ng-if=\"filter.type == 'date'\" >\n" +
    "\n" +
    "                                    <span class=\"md-block\">                \n" +
    "                                        <md-datepicker-container class=\"md-no-label md-no-message md-block\">\n" +
    "                                            <label>{{::filter.label}}</label>\n" +
    "                                            <md-datepicker ng-model=\"filter.model\" ng-change=\"dateSearch(filter)\"></md-datepicker>\n" +
    "                                        </md-datepicker-container>\n" +
    "                                    </span>\n" +
    "                                </div>\n" +
    "\n" +
    "                                <div class=\"interface interface-checkbox\" ng-if=\"filter.type == 'checkbox'\">\n" +
    "                                    <md-checkbox ng-change=\"search()\" ng-model=\"filter.model\" ng-true-value=\"'{{filter.checked}}'\" ng-false-value=\"'{{filter.unchecked}}'\" aria-label=\"Checkbox filter\"></md-checkbox>\n" +
    "                                </div>\n" +
    "\n" +
    "                            </div>\n" +
    "\n" +
    "                            <div ng-if=\"filter.isolate\" class=\"filter isolate\">\n" +
    "\n" +
    "                                <div class=\"filter-label\"></div>\n" +
    "\n" +
    "                                <div class=\"interface\">\n" +
    "                                    <md-checkbox ng-change=\"isolateSearch(filter)\" ng-model=\"filter.isolate.enabled\" ng-true-value=\"true\" ng-false-value=\"false\" aria-label=\"Checkbox filter\"></md-checkbox>\n" +
    "                                    {{filter.isolate.label}}\n" +
    "                                </div>\n" +
    "                            </div>                            \n" +
    "                        </div>\n" +
    "\n" +
    "                        <md-button class=\"md-button md-raised md-accent search-button\" ng-click=\"done()\">Done</md-button>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "\n" +
    "           \n" +
    "\n" +
    "            <!--\n" +
    "            <md-button ng-click=\"toggleFilters()\" md-no-ink class=\"md-icon-button md-icon-button-filters\" aria-label=\"Search filters\">\n" +
    "                <div class=\"material-icons icon-collapsed\" ng-show=\"extended_search\">expand_more</div>\n" +
    "                <div class=\"material-icons icon-expanded\" ng-show=\"!extended_search\">chevron_right</div>\n" +
    "            </md-button>\n" +
    "            -->\n" +
    "            <div class=\"backdrop\" ng-show=\"extended_search\" ng-click=\"toggleFilters()\"></div>\n" +
    "        </div>\n" +
    "\n" +
    "        <div ng-if=\"!options.inline\" class=\"full-search\" flex=\"grow\">\n" +
    "            <div ng-repeat=\"filters in groupedFilters\" layout=\"row\">\n" +
    "                <div ng-repeat=\"filter in filters\" class=\"filter filter-{{::filter.type}}\">\n" +
    "                    <md-input-container class=\"md-short-container\" ng-if=\"filter.type == 'select'\">\n" +
    "                        <label>{{::filter.label}}</label>\n" +
    "                        <md-select ng-model=\"filter.model\" ng-change=\"filterChange(filter)\">\n" +
    "                            <md-option ng-repeat=\"item in filter.values\" value=\"{{::item.value}}\">\n" +
    "                                {{::item.name}}\n" +
    "                            </md-option>\n" +
    "                        </md-select>\n" +
    "                    </md-input-container>\n" +
    "                    <md-input-container class=\"md-short-container md-input-has-placeholder\" ng-if=\"filter.type == 'text'\">\n" +
    "                        <label>{{::filter.label}}</label>\n" +
    "                        <input ng-model=\"filter.model\" ng-model-options=\"{debounce: 300}\" ng-change=\"filterChange(filter)\" aria-label=\"{{::filter.label}}\" />\n" +
    "                    </md-input-container>\n" +
    "                    <span ng-if=\"filter.type == 'range'\" layout=\"row\">\n" +
    "                         <md-input-container class=\"md-short-container filter-range-min\">\n" +
    "\n" +
    "                            <label>{{::filter.label}}</label>\n" +
    "\n" +
    "                            <input\n" +
    "                                placeholder=\"{{::filter.placeholder[0]}}\"\n" +
    "                                ng-model=\"filter.model['min']\"\n" +
    "                                ng-model-options=\"{debounce: 300}\"\n" +
    "                                ng-change=\"filterChange(filter)\"\n" +
    "                                aria-label=\"{{::filter.label}}\" />\n" +
    "                         </md-input-container>\n" +
    "\n" +
    "                         <md-input-container class=\"md-short-container filter-range-max\">\n" +
    "\n" +
    "                            <label>{{::filter.label}}</label>\n" +
    "\n" +
    "                            <input\n" +
    "                                placeholder=\"{{::filter.placeholder[1]}}\"\n" +
    "                                ng-model=\"filter.model['max']\"\n" +
    "                                ng-model-options=\"{debounce: 300}\"\n" +
    "                                ng-change=\"filterChange(filter)\"\n" +
    "                                aria-label=\"{{::filter.label}}\" />\n" +
    "                         </md-input-container>\n" +
    "                    </span>\n" +
    "                    <span ng-if=\"filter.type == 'date'\">                \n" +
    "                        <md-datepicker-container class=\"md-short-container\">\n" +
    "                            <label>{{::filter.label}}</label>\n" +
    "                            <md-datepicker ng-model=\"filter.model\" ng-change=\"filterChange(filter)\"></md-datepicker>\n" +
    "                        </md-datepicker-container>\n" +
    "                    </span>\n" +
    "                    <span ng-if=\"filter.type == 'newline'\">\n" +
    "                        <br>\n" +
    "                    </span>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div class=\"top-actions\">\n" +
    "            <md-button ng-repeat=\"action in options.topActions\" ng-if=\"!action.more\" ng-click=\"action.click($event)\" class=\"md-raised\" ng-class=\"{ 'md-accent': action.primary!==false }\">{{::action.label}}</md-button>\n" +
    "            <md-menu ng-if=\"(options.topActions | filter:{ more: true }).length > 0\">\n" +
    "                <md-button ng-click=\"$mdOpenMenu($event)\" class=\"md-icon-button more\">\n" +
    "                    <md-icon>more_vert</md-icon>\n" +
    "                </md-button>\n" +
    "                <md-menu-content>\n" +
    "                    <md-menu-item ng-repeat=\"action in options.topActions\" ng-if=\"action.more\">\n" +
    "                        <md-button ng-click=\"action.click($event)\">\n" +
    "                            <md-icon ng-if=\"action.icon\">{{::action.icon}}</md-icon>\n" +
    "                            {{::action.label}}\n" +
    "                        </md-button>\n" +
    "                    </md-menu-item>\n" +
    "                </md-menu-content>\n" +
    "            </md-menu>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div ng-if=\"options.paging.infinite && numeric(paging.records)\" class=\"infinite-records\">{{paging.records}} Records</div>\n" +
    "    <div class=\"results\" ng-if=\"options.columns.length\">\n" +
    "        <div class=\"progress-paged ng-hide\" ng-show=\"loading && !options.paging.infinite\">\n" +
    "            <md-progress-circular md-mode=\"indeterminate\"></md-progress-circular>\n" +
    "        </div>    \n" +
    "        <div class=\"lister-table\">\n" +
    "            <div class=\"lister-head\">\n" +
    "                <div class=\"lister-row\">\n" +
    "                    <div class=\"lister-col lister-col-header\" ng-if=\"options.sort\"></div>\n" +
    "                    <div class=\"lister-col lister-col-header lister-select-toogle\" ng-if=\"options.selection\">\n" +
    "                       \n" +
    "                        <md-checkbox ng-click=\"selectionsToggle(selectToogled);\" ng-model=\"selectToogled\"  ng-true-value=\"true\" aria-label=\"Toggle Selection\" class=\"select-checkbox\"></md-checkbox>\n" +
    "                        <md-menu md-offset=\"6 32\">\n" +
    "                            <md-button aria-label=\"Select\" class=\"md-icon-button\" ng-click=\"$mdOpenMenu($event)\">\n" +
    "                                <md-icon>arrow_drop_down</md-icon>\n" +
    "                            </md-button>\n" +
    "                            <md-menu-content>\n" +
    "                                <md-menu-item ng-repeat=\"action in options.selection.actions\">\n" +
    "                                    <md-button ng-click=\"selectMenu(action.click,$event)\">\n" +
    "                                        <md-icon ng-if=\"action.icon\">{{::action.icon}}</md-icon>\n" +
    "                                        {{::action.label}}\n" +
    "                                    </md-button>\n" +
    "                                </md-menu-item>\n" +
    "                            </md-menu-content>\n" +
    "                        </md-menu>\n" +
    "                    </div>\n" +
    "                    <div class=\"lister-col lister-col-header {{::column.className}}\" ng-repeat=\"column in options.columns\" ng-style=\"styleCols[$index]\" ng-class=\"{ order: column.order }\" ng-click=\"headerClick(column)\">\n" +
    "                        \n" +
    "                        <div class=\"wrap\">\n" +
    "                            <span fs-lister-compile=\"column.title\" fs-column=\"column\" class=\"title\"></span>\n" +
    "\n" +
    "                            <div class=\"direction\" ng-if=\"column.order\">\n" +
    "                                <span ng-switch=\"order.direction\" ng-show=\"order.name==column.order.name\">\n" +
    "                                    <md-icon ng-switch-when=\"asc\">arrow_downward</md-icon>\n" +
    "                                    <md-icon ng-switch-when=\"desc\">arrow_upward</md-icon>\n" +
    "                                </span>\n" +
    "                            </div>\n" +
    "                        </div>\n" +
    "                        <div class=\"width-holder\" ng-show=\"loading\"></div>\n" +
    "\n" +
    "                    </div>\n" +
    "                    <div class=\"lister-col lister-col-header\" ng-if=\"options.actions.length || options.action\">\n" +
    "                        <div class=\"width-holder\" ng-show=\"loading\"></div>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "            <div class=\"lister-body\" sv-root sv-part=\"data\" sv-on-sort=\"sortStop($item,$partTo,$indexFrom,$indexTo)\">\n" +
    "                <div class=\"lister-row\" sv-element=\"{ containment:'.lister-body'}\" ng-class=\"{ selected: checked[rowIndex] }\" ng-repeat=\"item in data\" ng-click=\"options.rowClick(item,$event); $event.stopPropagation();\" ng-init=\"rowIndex = $index\">\n" +
    "                    <div class=\"lister-col lister-col-sort\" ng-if=\"options.sort\"><div class=\"sort-handle\"><md-icon>drag_handle</md-icon></div></div>\n" +
    "                    <div class=\"lister-col\" ng-if=\"options.selection\">\n" +
    "                        <md-checkbox ng-model=\"checked[rowIndex]\" ng-true-value=\"1\" ng-click=\"select(item)\" aria-label=\"Select\" class=\"select-checkbox\"></md-checkbox>\n" +
    "                    </div>\n" +
    "                    <div class=\"lister-col {{::col.className}}\" ng-repeat=\"col in options.columns\" fs-lister-compile=\"dataCols[item.$$index][$index]\" fs-column=\"col\" fs-data=\"item\" ng-style=\"styleCols[$index]\"></div>\n" +
    "                    <div class=\"lister-col lister-actions\" ng-if=\"options.action\">\n" +
    "                        <md-button ng-click=\"actionClick(options.action,item,$event); $event.stopPropagation();\" class=\"md-icon-button\">\n" +
    "                            <md-icon class=\"material-icons\">{{::options.action.icon}}</md-icon>\n" +
    "                        </md-button>\n" +
    "                    </div>\n" +
    "                    <div class=\"lister-col lister-actions\" ng-if=\"options.actions.length\">\n" +
    "                        <md-menu ng-if=\"actionsShow(item)\">\n" +
    "                            <md-button ng-click=\"$mdOpenMenu($event)\" class=\"md-icon-button\">\n" +
    "                                <md-icon class=\"md-default-theme material-icons\">more_vert</md-icon>\n" +
    "                            </md-button>\n" +
    "                            <md-menu-content>\n" +
    "                                <md-menu-item ng-if=\"action.show(item)\" ng-repeat=\"action in options.actions\">\n" +
    "                                    <md-button ng-click=\"actionClick(action,item,$event)\">\n" +
    "                                        <md-icon class=\"material-icons\" ng-if=\"action.icon\">{{::action.icon}}</md-icon>\n" +
    "                                        {{::action.label}}\n" +
    "                                    </md-button>\n" +
    "                                </md-menu-item>\n" +
    "                            </md-menu-content>\n" +
    "                        </md-menu>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div class=\"status\" ng-if=\"options.paging.infinite\">\n" +
    "            <div class=\"norecords ng-hide\" ng-show=\"!loading && options.norecords && !data.length\">{{::options.norecords}}</div>\n" +
    "            <div class=\"progress-infinite ng-hide\" ng-show=\"loading\">\n" +
    "                <md-progress-circular md-mode=\"indeterminate\"></md-progress-circular>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"paging\" ng-if=\"options.paging.enabled && !options.paging.infinite\" layout=\"row\">\n" +
    "        <div class=\"records\">\n" +
    "            <label>Total</label>\n" +
    "            <div>{{paging.records}} Records</div>\n" +
    "        </div>\n" +
    "        <div flex>\n" +
    "            <ul class=\"pages\" ng-if=\"paging.pages>1 && options.paging.pages\">\n" +
    "                <li ng-class=\"{ disabled : paging.page == 1 }\">\n" +
    "                    <a href=\"javascript:;\" ng-click=\"page(1)\">&laquo;</a>\n" +
    "                </li>\n" +
    "                <li ng-class=\"{ disabled : paging.page == 1 }\" class=\"ng-scope\">\n" +
    "                    <a href=\"\" ng-click=\"page(paging.page - 1)\" class=\"ng-binding\">‹</a>\n" +
    "                </li>\n" +
    "                <li ng-repeat=\"number in [] | listerRange:paging.pages:paging.page\" ng-class=\"{ active : paging.page == (number + 1), disabled : number == '...' }\">\n" +
    "                    <a href=\"\" ng-click=\"page(number + 1)\">{{ number + 1}}</a>\n" +
    "                </li>\n" +
    "                <li ng-class=\"{ disabled : paging.page == paging.pages }\" class=\"ng-scope\">\n" +
    "                    <a href=\"\" ng-click=\"page(paging.page + 1)\" class=\"ng-binding\">›</a>\n" +
    "                </li>\n" +
    "                <li ng-class=\"{ disabled : paging.page == paging.pages }\">\n" +
    "                    <a href=\"\" ng-click=\"page(paging.pages)\">&raquo;</a>\n" +
    "                </li>\n" +
    "            </ul>\n" +
    "        </div>\n" +
    "        <div class=\"limits\">\n" +
    "            <md-input-container>\n" +
    "                <label>Show</label>\n" +
    "                <md-select ng-model=\"options.paging.limit\" md-on-close=\"reload()\">\n" +
    "                    <md-option ng-repeat=\"limit in options.paging.limits\" value=\"{{limit}}\">\n" +
    "                        {{::limit}} records\n" +
    "                    </md-option>\n" +
    "                </md-select>\n" +
    "            </md-input-container>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "\n"
  );

}]);
