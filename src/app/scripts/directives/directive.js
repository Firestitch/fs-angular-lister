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
                    <li><label>nested</label>An key/value paired object with options related to showing nested select options</li>
                    <ul>
                        <li><label>parent_field</label>name of field used to link to parent row. typically 'parent_id' or similar</li>
                        <li><label>label_field</label>name of field to use as rows label</li>
                        <li><label>value_field</label>name of the field to use as the rows value.  typically 'id'</li>
                        <li><label>children_field</label>name of field containing child objects in the filter.values array</li>
                    </ul>
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
            controller: ['$scope', function($scope) {

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

                        if(persisted[filter.name]) {


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

                $scope.topActionsClick = function(action,$event) {
                    if(action.click) {
                        action.click(filterValues(),$event);
                    }
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

                function prepSelectValues(filter) {
                	var values = [];

                	if(filter.values) {
                		//if filter has values then sort through them in case they have nested children and build a single list
                		var children_field = filter.nested && filter.nested.children_field ? filter.nested.children_field : 'children';

                		function walkValues(values, depth) {
                			var depth = depth || 0;
                			var prepped_values = [];
                			angular.forEach(values, function(obj,key) {
                				var value = {value: key, name: '', depth: depth};
                				if(typeof obj=='string') {
                					value.name = obj;
                				} else {
	                				if(obj.value)
    	            					value.value = obj.value;

                					value.name = obj.name;
                				}

								prepped_values.push(value);


                				if(typeof obj=='object' && obj[children_field])
                					Array.prototype.push.apply(prepped_values, walkValues(obj[children_field], depth+1));
                			});
                			return prepped_values;
                		}

                		Array.prototype.push.apply(values, walkValues(filter.values));


	               	} else if(filter.nested && filter.nested.objects) {
	               		//generate a list of values from objects that have not been nested.

	               		var value_field = filter.nested.value_field || 'id';
	               		var parent_field = filter.nested.parent_field || 'parent_id';
	               		var name_field = filter.nested.label_field || 'name';

	               		function walkValues(parent_id, values, depth) {
                			var depth = depth || 0;
                			var prepped_values = [];
                			angular.forEach(values, function(obj,key) {
                				if(obj[parent_field]!=parent_id)
                					return;

                				var value = {
                					value: obj[value_field],
                					name: obj[name_field],
                					depth: depth
                				};
								prepped_values.push(value);


                				var children = walkValues(obj[value_field], values, depth+1);
                				if(children.length>0)
                					Array.prototype.push.apply(prepped_values, children);
                			});

                			return prepped_values;
	               		}

	               		if(!filter.multiple)
	               			values.push({value:'__all', name:'All', depth:0});

	               		Array.prototype.push.apply(values, walkValues(null, filter.nested.objects));
                	}

                	return values;
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

                	if(filter.type=='select')
                		filter.values = prepSelectValues(filter);

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
            }],
            compile: function(element, tAttrs) {

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