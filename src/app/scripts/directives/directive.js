(function () {
	'use strict';

	/**
	 * @ngdoc directive
	 * @name fs.directives:fs-lister
	 * @restrict E
	 * @param {object} ls-options Options to configure the Lister.
	 * @param {string} ls-options.id An identifier used for lister boradcast reloading and the id placed in the markup
	 * @param {object} ls-options.instance A variable that will be extended with the instance of the lister
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
						<li><label>locals</label> An object used to store local data. Used in the footer.</li>
					</ul>
				</ul>
	 * @param {function} ls-options.init Called when all of the filter data has loaded
	 * @param {function} ls-options.rowClick Called when the row is clicked
	 * @param {function} ls-options.rowClass A function called per row to determine the row class.
     *			<ul>
	 *				<li><label>data</label>The row object</li>
	 *			</ul>
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
	 * @param {array} ls-options.topActions Adds action buttons to the right of the search interface
				<ul>
					<li><label>label</label>Used in the contextual menu item's label</li>
					<li><label>click</label>Triggered when clicked</li>
					<li><label>show</label>A boolean or function which when resolved will show/hide the button. Defaults to true</li>
					<li><label>type</label>Supported types: button, icon template</li>
					<li><label>icon</label>Icon used inside button</li>
					<li><label>items[]</label>Items used in the menu when action.type=='menu'
						<ul>
							<li><label>label</label>Used in the contextual menu item's label</li>
							<li><label>click</label>Triggered when clicked</li>
							<li><label>show</label>A boolean or function which when resolved will show/hide the button. Defaults to true</li>
							<li><label>icon</label>Icon used inside button</li>
						</ul>
					</li>
				</ul>
	* @param {object} ls-options.action Simular to ls-options.actions but directly places the icon in the row instead of having the multiple option.
	* @param {bool} ls-options.load Loads the lister data on directive load. Default true
	* @param {object} ls-options.paging Configures paging
				<ul>
					<li><label>infinite</label>Enables infinite scroll</li>
					<li><label>limit</label>Sets the limit per page</li>
				</ul>
	* @param {array} ls-options.orders Custom order bys that are not configured in the column ordered by
				<ul>
					<li><label>name</label>The name sent to the backend to be ordered by</li>
					<li><label>label</label>The label to be displayed to the user</li>
				</ul>
	* @param {object} ls-options.order Sets the default ordering
				<ul>
					<li><label>name</label>The name of the order which is specified in option.orders </li>
					<li><label>direction</label>The direction of the ordering asc or desc</li>
				</ul>
	* @param {string} ls-options.order Sets the default ordering name which is specified in option.orders
	* @param {object} ls-options.norecords The message to be displayed when there are no records in the search
	* @param {object} ls-options.selection Enables the checkbox selection interface found on the left side
				<ul>
					<li><label>actions[]</label> Sets the menus options for the selection interface</li>
					<ul>
						<li><label>label</label>Used in the contextual menu item's label</li>
						<li><label>click</label>Is triggered when the contextual menu item is clicked. First param an array of selected objects and the second param is the $event</li>
						<li><label>icon</label>Used in the contextual menu item icon</li>
						<li><label>show</label>A boolean or function which when resolved will show/hide the menu item. Defaults to true</li>
					</ul>
				</ul>
	* @param {array} ls-options.headers Defines the headers for the lister
				<ul>
					<li><label>title</label>Specifies the column tile</li>
					<li><label>className</label>A css class name that is appened to the column element</li>
					<li><label>center</label>Align center</li>
					<li><label>right</label>Align the right</li>
					<li><label>styles</label>Configuration for the column header</li>
				</ul>
	* @param {array} ls-options.columns Defines the columns for the lister
				<ul>
					<li><label>title</label>Specifies the column tile</li>
					<li><label>value</label>Is triggered when the rendering the column and is passed a data parameter which corresponds to the row's record</li>
					<li><label>className</label>A css class name that is appened to the column element</li>
					<li><label>resolve</label>Used to inject objects in the value() function and inserts the values into the $scope variable</li>
					<li><label>scope</label>Appended to the $scope object which is injected into the value() function</li>
					<li><label>order</label>Enables the column to be orderable. The value is used as the order value in the http request. ie: order=name,asc</li>
					<li><label>center</label>Align center</li>
					<li><label>right</label>Align the right</li>
					<li><label>show</label>Show or hide the column</li>
					<li><label>header</label>Configuration for the column header</li>
					<ul>
						<li><label>styles</label>Object of styles</li>
					</ul>
					<li><label>footer</label>Configuration for the column footer</li>
					<ul>
						<li><label>center</label>Align center</li>
						<li><label>right</label>Align the right</li>
						<li><label>value</label>A function or template used for the footer formatting</li>
						<li><label>scope</label>The scope used when rendering the footer cell</li>
					</ul>
				</ul>

	 * @param {array} ls-options.filters Defines the filters found above the lister table
				<ul>
					<li><label>name</label>the name in the query object passed to the fetch data process</li>
					<li><label>type</label>select (single selection dropdown) or text (one line input box) or date</li>
					<li><label>label</label>The label of the interface</li>
	 				<li><label>alias</label>The another label what can be shown in search line instead main label</li>
					<li><label>values</label>An key/value paired object with a list of filterable values. To avoid specifying a filter value use the key '__all'.  Applies only ror select type filters.</li>
					<li><label>default</label>Sets the default filter value</li>
					<li><label>disabled</label>When set to true the filter will not be visible</li>
					<li><label>wait</label>When set to true the filters values will be prepared before the lister data is fetched</li>
					<li><label>change</label>Callback function which fires when the filter values changes. change: function(instance) {...}</li>
					<li><label>nested</label>An key/value paired object with options related to showing nested select options</li>
					<li><label>query</label>Sets the value of the filter from the current url query parameter. Overrides default and persistence.</li>
					<ul>
						<li><label>parent_field</label>name of field used to link to parent row. typically 'parent_id' or similar</li>
						<li><label>label_field</label>name of field to use as rows label</li>
						<li><label>value_field</label>name of the field to use as the rows value.  typically 'id'</li>
					</ul>
				</ul>
	* @param {array} ls-options.container Specifies the container that is listened to for scroll events and triggers page loads in infinite listers. If no container is specified the browser window is used.
	* @param {object=} ls-instance Object to be two way binded. This can be useful when trying to access the directive during run time.
	* @param {function} ls-instance.load Will load the lister with the current filters and page
	* @param {function} ls-instance.reload Will load the lister with the current filters and on the first page
	* @param {function} ls-instance.filterValues Will return the current filter values
	* @param {function} ls-instance.filter Will return the filter object with the specified name.  var filter = instance.filter('state');
	* @param {function} ls-instance.data Will return the current data set
	* @param {function} ls-instance.options Set/Gets options. Zero arguments passed will return all options. One argument passed will return that option's value. Two arguments passed will set option with the value.
	*/

	var ListerDirective = [ '$compile', '$sce', '$filter', '$window', '$log', '$q', 'fsUtil', '$mdDialog', 'fsDatetime', '$mdMedia',
							'fsStore', '$rootScope', 'fsLister', '$location', '$templateCache', 'fsArray', 'fsModal', 'fsAlert',
							function ($compile, $sce, $filter, $window, $log, $q, fsUtil, $mdDialog, fsDatetime, $mdMedia,
									fsStore, $rootScope, fsLister, $location, $templateCache, fsArray, fsModal, fsAlert) {
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
				options: '=lsOptions',
				instance: '=?lsInstance'
			},
			controller: ['$scope', function($scope) {
				var options = $scope.options || {};
				options.instance = {};
				angular.forEach(angular.copy(fsLister.options()),function(value,key) {
					if(!(key in options)) {
						options[key] = value;
					}
				});

				if(options.paging===false)
					options.paging = { enabled: false };

				options.paging = options.paging || {};
				options.paging.enabled = options.paging.enabled===undefined ? true : options.paging.enabled;
				options.paging.pages = options.paging.pages===undefined ? true : options.paging.pages;
				options.paging.limits = options.paging.limits ? options.paging.limits : [10, 25, 50, 100, 200];
				options.paging.limit = options.paging.limit ? options.paging.limit : options.paging.limits[0];
				options.norecords = options.norecords===undefined ? 'No records found' : options.norecords;
				options.namespace = options.namespace ? options.namespace : 'lister';
				options.load = options.load===undefined ? true : options.load;
				options.actions = options.actions || [];
				options.filters = options.filters || [];

				var dataIndex = 0,
					filterChange = false,
					persists = fsStore.get(options.namespace + '-persist',{});

				if(options.id) {

					$scope.$on(options.namespace + '-' + options.id,function(e,data) {
						if(data.action=='reload') {
							options.instance.reload();
						}

						if(data.action=='extend') {
							options.instance.data.extend(data.object, data.filters);
						}
					});
				}

				if(options.persist) {

					if(!angular.isObject(options.persist)) {
						options.persist = { name: options.persist };
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
				$scope.actionCols = [];
				$scope.options = options;
				$scope.options.orders = $scope.options.orders || [];
				$scope.paging = { records: 0, page: 1, pages: 0 };
				$scope.loading = false;
				$scope.selection = { all: false, selected: [] };
				$scope.debug = false;
				$scope.load = load;
				$scope.reload = reload;
				$scope.numeric = numeric;
				$scope.extended_search = false;
				$scope.searchinput = { value: '' };
				$scope.paged = null;
				$scope.locals = {};
				$scope.rowClasses = [];
				$scope.id = options.id ? options.namespace + '-' + options.id : '';
				$scope.orderDirections = { 'asc': 'ascending', 'desc': 'descending' };
				$scope.order = options.order;

				angular.forEach(options.columns,function(col,index) {
					col.show = col.show===undefined ? true : col.show;

					if(col.footer) {
						$scope.footer = true;
					}

					if(col.order) {
						if(angular.isString(col.order)) {
							col.order = { name: col.order };
						}

						if(!col.order.direction) {
							col.order.direction = 'asc';
						}

						if(!col.order.label) {
							col.order.label = col.title;
						}

						col.order.column = true;

						var order = $filter('filter')($scope.options.orders,{ name: col.order.name },true);

						if(!order.length) {
							$scope.options.orders.push(col.order);
						}
					}
				});

				if(options.selection) {

					options.selection.show = options.selection.show===undefined ? false : options.selection.show;
					angular.forEach(options.selection.actions,function(action) {
						if(action.show===undefined) {
							action.show = true;
						}

						if(angular.isFunction(action.show)) {
							action.show = action.show();
						}

						if(action.show) {
							options.selection.show = true;
						}
					});
				}

				if(options.topActions) {
					angular.forEach(options.topActions,function(action) {
						if(action.show===undefined) {
							action.show = true;
						}

						if(action.type===undefined) {
							action.type = 'button';
						}

						if(angular.isFunction(action.show)) {
							action.show = action.show();
						}

						if(action.type=='menu' && action.items) {

							if(!action.icon) {
								action.icon = 'more_vert';
							}

							angular.forEach(action.items,function(item) {
								if(item.show===undefined) {
									item.show = true;
								}

								if(angular.isFunction(item.show)) {
									item.show = item.show();
								}
							});
						}
					});
				}

				if(!$scope.order) {
					var order = $filter('filter')($scope.options.orders,{ column: true, default: true },true)[0];
					$scope.order = angular.copy(order);
				}

				if(!$scope.order && $scope.options.orders.length) {
					$scope.order = angular.copy($scope.options.orders[0]);
				}

				if($scope.order) {

					var orderName = $scope.order;
					var orderDirection = 'asc';

					if(angular.isObject($scope.order)) {
						orderName = $scope.order.name;
						orderDirection = $scope.order.direction || 'asc';
					}

					var order = $filter('filter')($scope.options.orders,{ name: orderName },true)[0];
					if(order) {
						$scope.order = angular.copy(order);
						$scope.order.direction = orderDirection;
					}
				}

				angular.forEach(options.columns,function(col) {
					if(!$scope.order && col.order) {
						$scope.order = angular.copy(col.order);
					}
				});

				sanitizeAction(options.action);
				angular.forEach(options.actions,function(action) {
					sanitizeAction(action);
				});

				var instance =
				{
					load: load,
					page: {
						set: function(page) {
							$scope.paging.page = page;
							load();
						}
					},
					reload: reload,
					local: {
						get: function(name) {
							return $scope.locals[name];
						},
						set: function(name, value) {
							$scope.locals[name] = value;
							$scope.locals = angular.copy($scope.locals);
						},
						locals: $scope.locals
					},
					data: {
						gets: function(filters) {

							if(fsUtil.isEmpty(filters)) {
								return $scope.data;
							}

							var flen = options.filters.length,
								len = $scope.data.length,
								items = [];
							for(var i=0; i<len; i++) {

								var valid = true;
								angular.forEach(filters,function(value,name) {
									if(!valid || $scope.data[i][name]!==value)
										valid = false;
								});

								if(valid) {
									items.push($scope.data[i]);
								}
							}

							return items;
						},
						extend: function(object, filters) {
							angular.forEach(instance.data.gets(filters),function(item) {
								angular.extend(item,object);
							});
						},
						set: function(data) {
							callback(data);
						},
						remove: function(filters) {

							if(fsUtil.isInt(filters)) {
								filters = { $$index: filters };
							}

							var items = instance.data.gets(filters);
							angular.forEach(items,function(item) {
								var index = $scope.data.indexOf(item);
								if(index!==null) {
									$scope.data.splice(index, 1);
									if($scope.paging.records>0) {
										$scope.paging.records--;
									}
								}
							});
						},
						clear: function() {
							$scope.data = [];
							$scope.paging = { records: 0, page: 1, pages: 0 };
						},
						data: $scope.data
					},
					filter: {
						saved: {
							select: function(item) {

								if(!options.savedFilter) {
									options.savedFilter = {};
								}

								options.savedFilter.active = item;
								angular.forEach(options.savedFilter.filters,function(value) {
									value.active = false;
								});

								clear();

								if(item) {

									item.active = true;
									angular.forEach(item.values,function(value,name) {
										var filter = fsArray.filter(options.filters,{ name: name })[0];
										if(filter) {
											filter.model = value;
										}
									});

									reload();
								}
							}
						},
						clear: clear,
						get: function(name) {
							return fsArray.filter(options.filters, { name:name })[0];
						},
						set: function(filter) {
							var _filter = instance.get(name);
							if(_filter) {
								angular.extend(_filter,filter);
							}
						},
						value: {
							get: function(name, opts) {
								return instance.filter.value.gets(opts)[name];
							},
							gets: function(opts) {

								var opts = opts || {};
								var query = {};

								if($scope.order) {
									query.order = $scope.order.name + ',' + $scope.order.direction;
								}

								angular.forEach(options.filters,function(filter) {

									var value = angular.copy(filter.model);

									if(filter.type=='select') {

										if(filter.multiple) {

											if(filter.isolate) {
												if(!fsUtil.isArray(filter.model) || !filter.model.length) {
													value = fsArray.list(filter.values,'value');
												}
											}

										} else {

											if(filter.isolate) {
												if(filter.model=='__all') {
													value = fsArray.list(filter.values,'value');
												}
											} else {
												if(filter.model=='__all') {
													value = null;
												}
											}
										}
									} else if(filter.type=='autocompletechips') {
										if(fsUtil.isArray(filter.model) && filter.model.length && !opts.expand) {
											value = fsArray.list(filter.model,'value');
										}
									}

									if(fsUtil.isEmpty(value,{ zero: true })) {
										return;
									}

									if(filter.type=='date' || filter.type=='datetime') {

										if(value) {
											value = moment(value).format();
										}

									} else if(filter.type=='daterange' || filter.type=='datetimerange') {

										var from 	= value['from'];
										var to 		= value['to'];

										value = {};
										if(from) {
											value.from = moment(from).format();
										}

										if(to) {
											value.to = moment(to).format();
										}

									} else if(filter.type=='autocomplete') {

										if(fsUtil.isEmpty(filter.model.value,{ zero: true })) {
											return;
										}

										value = opts.expand ? filter.model : filter.model.value;
									}

									if(filter.type=='daterange' || filter.type=='datetimerange') {

										if(opts.nested) {
											query[getFilterName(filter)] = value;

										} else {
											angular.forEach(filter.name,function(key,name) {
												if(value[name]) {
													query[key] = value[name];
												}
											});
										}

									} else if(fsUtil.isObject(filter.names) && opts.names!==false) {

										angular.forEach(filter.names,function(key,name) {
											if(value[name]) {
												query[key] = value[name];
											}
										});
									} else {
										query[filter.name] = value;
									}
								});

								if(opts.flatten) {
									angular.forEach(query,function(value,name) {
										if(fsUtil.isArray(value)) {
											query[name] = value.join(',');
										}
									});
								}

								return query;
							},
							set: function(name, value, opts) {
								opts = opts || {};
								var filter = instance.filter.get(name);
								if(filter) {
									filter.model = value;
									if (moment.isMoment(filter.model)) {
										filter.model = filter.model.toDate();
									}

									if(opts.reload===undefined || opts.reload) {
										reload();
									}
								}
							},
							sets: function(values, opts) {
								opts = opts || {};
								angular.forEach(values,function(value,name) {
									instance.filter.value.set(name,value,{ reload: false });
								});

								if(opts.reload===undefined || opts.reload) {
									reload();
								}
							}
						},
						filters: options.filters
					},
					option: {
						get: function(name) {
							return options[name];
						},
						set: function(name,value) {
							options[name] = value;
						},
						options: options
					},
					search: {
						update: searchUpdate
					},
					clear: function() {
						instance.data.clear();
						instance.filter.clear();
					},
					selection: {
						gets: function() {
							var selected = [];
							angular.forEach($scope.selection.selected,function(value, index) {
								if(value) {
									selected.push($scope.data[index]);
								}
							});

							if($scope.selection.all) {
								selected = 'all';
							}

							return selected;
						}
					}
				};

				$scope.page = instance.page.set;

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

				$scope.savedFilterSave = function() {
					$scope.savedFilterModal('save');
				}

				$scope.savedFilterManage = function() {
					$scope.savedFilterModal('listing');
				}

				$scope.savedFilterModal = function(mode) {
					fsModal
					.show(	'listerSavedFiltersCtrl',
							'views/directives/listermodal.html',
							{
								resolve: {
									options: function() { return options; },
									mode: function() { return mode; }
								}
							});
				}

				$scope.savedFilterSelect = function(item) {
					instance.filter.saved.select(item);
					if(options.savedFilter.change) {
						options.savedFilter.change(item);
					}
				}

				$scope.headerClick = function(col) {

					if(col.order) {

						if($scope.order.name==col.order.name) {
							$scope.order.direction = $scope.order.direction=='asc' ? 'desc' : 'asc';
						} else {
							$scope.order.direction = col.order.direction;
						}

						$scope.order.name = col.order.name;
						$scope.order.label = col.order.label;

						reload();
					}
				}

				$scope.sortStart = function() {
					$scope.sorting = true;
				}

				$scope.sortStop = function(item,partTo,indexFrom,indexTo) {
					$scope.sorting = false;

					var list = [];
					angular.forEach(partTo,function(object) {
						list.push(object);
					});

					$scope.options.sort.stop(item,list,indexFrom,indexTo);
				}

				$scope.actionClick = function(action, item, event) {

					if(action.delete && action.delete.ok) {

						fsModal.confirm({
							title: action.delete.title || 'Confirm',
						    content: action.delete.content
						}).then(function() {

							var result = action.delete.ok(item, event);
							return $q(function(resolve) {
								if(result && angular.isFunction(result.then)) {
									result.then(resolve);
								} else {
									resolve();
								}
							}).then(function() {
								$scope.options.instance.data.remove(item.$$index);
							});

						},function() {
							if(action.delete.cancel) {
								action.delete.cancel(item, event);
							}
						});

					} else if(action.click) {
						action.click(item, event);
					}
				}

				$scope.reset = function() {
					clear();
					filterChange = true;
				}

				$scope.clear = function() {
					clear();
					reload();
				}

				$scope.selectionsToggle = function() {

					$scope.selection.selected = [];
					if($scope.selection.checked) {
						$scope.selection.all = false;
					} else {

						for(var i=0;i<$scope.data.length;i++) {
							$scope.selection.selected.push(1);
						}

						var records = $scope.paging && $scope.paging.records ? $scope.paging.records : 0;
						var msg = 'Selected ' + $scope.selection.selected.length + ' of ' + records + ' results';

						if($scope.options.selection.all && records>$scope.selection.selected.length) {
							msg += ' <a href ng-click="click()" class="selection-all">Select all ' + records + ' records</a>';
						}

						fsAlert.info(msg,{
							toastClass: 'fs-lister-selection',
							locals: {
								click: function() {
									$scope.selection.all = true;
									setTimeout(function() {
										fsAlert.info('Selected all ' + records + ' records');
									},100);
								}
							},
							controller: ['$scope', 'click', function($scope, click) {
								$scope.click = click;
							}]
						});
					}
				}

				$scope.limitSelect = function(limit) {
					options.paging.limit = limit;
					reload();
				}

				$scope.orderNameSelect = function(order) {
					$scope.order.name = order.name;
					$scope.order.label = order.label;
					reload();
				}

				$scope.orderDirectionToggle = function() {
					$scope.order.direction = $scope.order.direction=='asc' ? 'desc' : 'asc';
					reload();
				}

				$scope.selectionClick = function(action, $event) {
					var selected = instance.selection.gets();
					action.click(selected, $event, $scope.instance);
					$scope.selectionsClear();
				}

				$scope.selectionsClear = function() {
					$scope.selection.selected = [];
					$scope.selection.checked = false;
					$scope.selection.all = false;
				}

				$scope.searchClick = function(e) {
					if($mdMedia('gt-xs')) {

						searchUpdate();

						if(window.getSelection && window.getSelection().toString()) {
							var selected = window.getSelection().toString();
							if(selected) {
								setTimeout(function() {
									var index = e.target.value.indexOf(selected);
									if(index>=0) {
										e.target.setSelectionRange(index,index + selected.length);
									}
								});
							}
						}

						$scope.searchShow();
					}
				}

				$scope.searchShow = function(event) {
					$scope.searchToggle(true);
				}

				$scope.searchToggle = function(value, search) {

					$scope.extended_search = value;
					setTimeout(function() {
						var body = angular.element(document.body);
						value ? body.addClass('fs-lister-filters-open') : body.removeClass('fs-lister-filters-open');
					});

					if(search && !value && filterChange) {
						reload();
					}

					if(value) {
						filterChange = false;
					}

					searchUpdate();
				}

				$scope.dateSearch = function(filter) {
					$scope.filterChange(filter);
				}

				$scope.topActionsClick = function(action,$event) {
					if(action.click) {
						action.click(instance.filter.value.gets(), $event, $scope.instance);
					}
				}

				$scope.isolateChange = function(filter) {

					if(filter.isolate.enabled) {
						filter.model = filter.multiple ? [filter.isolate.value] : filter.isolate.value;
					} else {
						filter.model = null;
					}

					$scope.filterChange(filter);
				}

				$scope.filterKeyup = function(filter,$event) {
					if(filter.type=='text' || filter.type=='select') {
						if($event.keyCode==13) {
							setTimeout(function() {
								$scope.filterChange(filter);
								$scope.searchToggle(false,true);
							});
						}
					}
				}

				$scope.selectChange = function(filter) {
					if(filter.isolate) {
						filter.isolate.enabled = false;

						if(filter.multiple && fsUtil.isArray(filter.model)) {
							var index = filter.model.indexOf(filter.isolate.value);

							if(index > -1) {
								filter.model.splice(index,1);
							}
						}
					}

					$scope.filterChange(filter);
				}

				$scope.filterChange = function(filter) {

					filterChange = true;
					if($scope.options.savedFilter) {
						$scope.options.savedFilter.active = null;
					}

					if(filter.change) {
						filter.change();
					}
				}

				$scope.searchKeydown = function(event, operation)  {
					$scope.searchToggle(event.keyCode!=13);
				};

				$scope.searchChange = function(search) {

					if($scope.options.savedFilter) {
						$scope.options.savedFilter.active = null;
					}

					angular.forEach(options.filters,function(filter) {
						if(filter.type=='text') {

							//Remove Search:
							var text = search.match(new RegExp('(' + filter.label + ':$)','i'));
							if(text) {
								search = search.replace(text[1],'');
							}

							//Wrap text with spaces in brackets
							var text = search.match(new RegExp(filter.label + ':([^:\(\)]+)($|\s[\(\w\s]+:)','i'));
							if(text) {
								search = search.replace(text[1],'(' + text[1] + ')');
							}
						}
					});

					var matches = search.match(/(\([^\)]+\):\([^\)]+\)|\([^\)]+\):[^\s]+|[^:]+:\([^\)]+\)|[^\s]+)/g);
					var values = {};
					var textSearch = [];
					angular.forEach(matches, function(match) {

						var filter_match = match.trim().match(/\(?([^:\)]+)\)?:\(?([^)]+)/);

						if(filter_match) {
							values[filter_match[1].trim()] = filter_match[2];
						} else {
							textSearch.push(match);
						}
					});

					filtersClear();
					angular.forEach(options.filters,function(filter) {
						if(filter.type=='text' && filter.primary) {
							filter.model = textSearch.join(' ');
						}
					});

					angular.forEach(values,function(value, label) {

						var filter = $filter('filteri')(options.filters,{ label: label },true)[0];

						if(filter) {

							if(filter.type=='date' || filter.type=='datetime') {

								var date = fsDatetime.parse(value);

								if(date) {
									filter.model = moment(date);
								}

							} else if(filter.type=='daterange') {

								var parts = value.split(/\s+to\s+/);
								var from = fsDatetime.parse(parts[0]);
								var to = fsDatetime.parse(parts[1]);

								filter.model = {};

								if(from) {
									filter.model.from = from;
								}

								if(to) {
									filter.model.to = to;
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
						}
					});

					reload({ searchUpdate: false });
				}

				function walkSelectValues(filter, filterValues) {

					var values = [];
					angular.forEach(filterValues, function(obj,key) {
						var value = { value: key, name: obj };

						if(typeof obj=='object') {
							value = obj;
						}

						if(value.value===null) {
							value.value = 'null';
						}

						values.push(value);
					});

					return values;
				}

				function walkSelectNestedValues(filter, parent_id, values, depth) {
					var depth = depth || 0;
					var prepped_values = [];
					var value_field = filter.nested.value_field || 'id';
					var parent_field = filter.nested.parent_field || 'parent_id';
					var name_field = filter.nested.label_field || 'name';

					angular.forEach(values, function(obj,key) {
						if(obj[parent_field]!=parent_id) {
							return;
						}

						var value = {
							value: obj[value_field],
							name: obj[name_field],
							depth: depth,
							style: { 'margin-left': (depth * 16) + 'px' }
						};

						prepped_values.push(value);

						var children = walkSelectNestedValues(filter, obj[value_field], values, depth+1);
						if(children.length>0) {
							Array.prototype.push.apply(prepped_values, children);
						}
					});

					return prepped_values;
				}

				function clear() {
					filtersClear();
					searchUpdate();
				}

				function filtersClear() {
					angular.forEach(options.filters,function(filter) {
						filter.model = undefined;
						if(filter.type=='autocomplete') {
							filter.model = null;
							filter.search = '';
						} else if(filter.type=='autocompletechips') {
							filter.model = [];
							filter.search = '';
						} else if(filter.type=='select' && filter.isolate) {
							filter.model = null;
							filter.isolate.enabled = false;
						} else if(filter.type=='checkbox') {
							filter.model = filter.unchecked;
						}
					});
				}

				function sanitizeAction(action) {
					action = action || {};

					if(action.delete) {
						action.label = (action.label !== undefined) ?  action.label : 'Remove';
						action.icon = (action.icon !== undefined) ? action.icon  : 'delete';
					}

					if(action.show===undefined) {
						action.show = true;
					}

					return action;
				}

				function searchUpdate() {

					var label, formatted, searches = [];
					angular.forEach(options.filters,function(filter) {

						var value = angular.copy(filter.model);

						if(filter.type=='select') {

							if(filter.multiple) {

								if(!fsUtil.isArray(value) || !value.length) {
									return;
								}

								var values = [];
								angular.forEach(value,function(item) {
									angular.forEach(filter.values,function(filter_item) {
										if(!String(filter_item.value).localeCompare(String(item))) {
											values.push(filter_item.name);
										}
									});
								});

								value = values.join(',');

							} else {

								if(value=='__all' || value===null || value===undefined) {
									return;
								}

								angular.forEach(filter.values,function(filter_item) {
									if(!String(filter_item.value).localeCompare(String(value))) {
										value = filter_item.name;
									}
								});
							}

							if(filter.isolate) {

								if(filter.isolate.enabled) {
									value = filter.isolate.label;
								}
							}
						}

						if(fsUtil.isEmpty(value,{ zero: true })) {
							return;
						}

						if(filter.type=='autocomplete') {
							value = filter.model.name;

						} else if(filter.type=='autocompletechips') {

							if(!fsUtil.isArray(filter.model) || !filter.model.length) {
								return;
							}

							var values = [];
							angular.forEach(filter.model,function(item) {
								values.push(item.name);
							});

							value = values.join(',');

						} else if(filter.type=='date' || filter.type=='datetime') {

							var format = 'MMM D, YYYY';

							if(filter.type=='datetime') {
								format += ' h:mm a';
							}

							value = fsDatetime.moment(value);

							if(!value) {
								return;
							}

							value = value.format(format);

						} else if(filter.type=='daterange' || filter.type=='datetimerange') {

							if(value) {
								var from 	= fsDatetime.moment(value.from);
								var to 		= fsDatetime.moment(value.to);
								var format = filter.type=='datetimerange' ? 'MMM D, YYYY h:mm a' : 'MMM D, YYYY';
								value = [];

								if(from) {
									value.push(from.format(format));
								}

								if(to) {
									value.push(to.format(format));
								}

								value = value.join(' to ');
							}

						} else if(filter.type=='checkbox') {

							if(filter.model==filter.unchecked) {
								return;
							} else {
								value = 'Yes';
							}

						} else if(filter.type=='range') {

							var min = value['min'];
							var max = value['max'];

							var parts = [];
							if(min) {
								parts.push(min);
							}

							if(max) {
								parts.push(max);
							}

							value = parts;
						}

						value = String(value);

						if (filter.alias) {
							label = filter.alias.match(/\s/) ? '(' + filter.alias + ')' : filter.alias;
						} else {
							label = filter.label.match(/\s/) ? '(' + filter.label + ')' : filter.label;
						}

						formatted = label + ':' + (value.match(/\s/) ? '(' + value + ')' : value);
						searches.push({	value: value,
										type: filter.type,
										formatted: formatted });
					});

					$scope.searchinput.value = '';
					if(searches.length===1 && searches[0].type=='text') {
						$scope.searchinput.value = searches[0].value;
					} else {
						angular.forEach(searches,function(search) {
							$scope.searchinput.value += search.formatted + ' ';
						});

						$scope.searchinput.value = $scope.searchinput.value.trim();
					}
				}

				function clearData() {
					dataIndex = 0;
					$scope.data = [];
					$scope.dataCols = [];
					$scope.actionCols = [];
					instance.data.data = [];
				}

				function reload(opts) {
					return load(angular.extend({},{ page: 1, clear: true },opts))
					.then(function() {
						$scope.resize(opts);
					});
				}

				function load(opts) {
					opts = opts || {};
					return $q(function(resolve, reject) {

						if(opts.searchUpdate!==false) {
							searchUpdate();
						}

						if($scope.loading)
							return resolve();

						opts = opts || {};

						if(opts.clear===true) {
							$scope.paged = null;
						}

						if($scope.options.paging.infinite && $scope.paged) {
							if($scope.paged.records <= ($scope.paged.limit * $scope.paged.page)) {
								return resolve();
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

						var query = instance.filter.value.gets({ flatten: true });

						if(options.persist) {
							persists[options.persist.name] = { data: instance.filter.value.gets({ expand: true, names: false, nested: true }), date: new Date() };
						}

						if($scope.options.paging.enabled && fsUtil.isNumeric($scope.options.paging.limit)) {
							if($scope.paging.page!==undefined) {
								query.page = $scope.paging.page;
							}

							query.limit = $scope.options.paging.limit;
						}

						if($scope.order) {
							query.order = $scope.order.name + ',' + $scope.order.direction;
						}

						log("Calling data()", query);

						try {

							if(options.data) {

								$scope.loading = true;
								var response = options.data(query,angular.bind(this,deprecatedDataCallback,opts,resolve));

								if(response && response.then) {

									response
									.then(function(response) {
										dataCallback(opts,resolve,response.data,response.paging,response.locals);
									})
									.catch(function(e) {
										reject();
										throw e;
									});
                } else {
                  $scope.loading = false;
                }
							}

					   	} catch(e) {
							reject();
							throw e;
						}
					})
					.finally(function() {
						$scope.loading = false;
					});
				}

				function deprecatedDataCallback(opts, resolve, data, paging, locals) {
					console.warn('fs-angular-lister data cb() function has been deprecated. Please return promises with the data() function.');
					dataCallback(opts, resolve, data, paging, locals);
				}

				function dataCallback(opts, resolve, data, paging, locals) {

					if(!fsUtil.isArray(data)) {
						throw 'Invalid callback data';
					}

					log("dataCallback()", data, paging, locals);

					if(opts.clear) {
						$scope.max_bottom = 0;
						clearData();
					}

					return callback(data, paging, locals).then(resolve);
				}

				function callback(data, paging, locals) {

					return $q(function(resolve) {

						if(!$scope.options.paging.infinite) {
							clearData();
						}

						if(locals) {
							angular.extend($scope.locals,locals);
							$scope.locals = locals;
						}

						if(options.group) {
							var ol = data.length, groupData = [];
							for (var o = 0; o < ol; o++) {
								groupData.push({ listerGroup: data[o] });
								groupData = groupData.concat(data[o][options.group.children]);
							}
							data = groupData;
						}

						var ol = data.length;
						for (var o = 0; o < ol; o++) {

							var cl = options.columns.length;
							var cols = [];

							for (var c=0; c<cl; c++) {

								var col = options.columns[c];
								var value = col.value;

								if(typeof col.value =='function') {
									value = col.value(data[o]);
								}

								cols[c] = value;
							}

							$scope.dataCols[dataIndex] = cols;

	                        $scope.actionCols[dataIndex] = [];
	                        var showActions = false;
	                        angular.forEach(options.actions,function(action,aindex) {
	                        	$scope.actionCols[dataIndex][aindex] = true;
	                        	if(angular.isFunction(action.show)) {
	                        		if(!action.show(data[o])) {
	                        			$scope.actionCols[dataIndex][aindex] = false;
	                        		}
	                        	}

	                        	showActions |= $scope.actionCols[dataIndex][aindex];
	                        });

	                        if(!showActions) {
	                        	$scope.actionCols[dataIndex] = [];
	                        }

							data[o].$$index = dataIndex;

							if($scope.options.rowClass)
								$scope.rowClasses[dataIndex] = $scope.options.rowClass(data[o]);

							$scope.data.push(data[o]);

							dataIndex++;
						}

						instance.data.data = $scope.data;
						$scope.paging.records = null;

						if(paging) {

							if(paging.records===null) {
								$scope.options.paging.enabled = false;
							}

							$scope.paging.records = paging.records;
							$scope.paging.pages = paging.pages;

							if(paging.limit) {
								$scope.options.paging.limit = paging.limit;
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

						//promise/timeout used to offset the timing for the template render time
						setTimeout(function() {
							resolve();
						});
					});
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

				function getFilterName(filter) {
					if(filter.type=='daterange' || filter.type=='datetimerange') {
						return filter.name.from + '-' + filter.name.to;
					}

					return filter.name;
				}

				var primary = false;
				function sanitizeFilter(filter) {

					var name = getFilterName(filter);

					if(options.persist) {

						var persisted = persists[options.persist.name]['data'];

						if(persisted[name]) {

							var value = persisted[name];

							if(value) {

								if(filter.type=='daterange' || filter.type=='datetimerange') {

									value.from = value.from ? moment(value.from) : null;
									value.to = value.to ? moment(value.to) : null;

								} else if(filter.type.match(/^date/)) {
									value = moment(value);
								}
							}

							// If there are any values then wait for any possible async values
							filter.wait = true;
							filter.model = value;
						}
					}

					var promise = $q(function(resolve,reject) {

						var values = filter.values;
						if(typeof filter.values=='function' && !filter.type.match(/^autocomplete/)) {
							values = values();
						}

						if(angular.isObject(values) && values.then) {

							values
							.then(function(values) {
								resolve(values);
							});

						} else {
							resolve(values);
						}

					}).then(function(values) {

						if(filter.type=='daterange' || filter.type=='datetimerange') {
							name = getFilterName(filter);
						} else if(filter.name && fsUtil.isObject(filter.name)) {
							name = Object.keys(filter.names).join('-');
						}

						if(filter.primary) {
							primary = true;
						} else {
							filter.primary = false;
						}

						if(filter.type=='checkbox') {
							filter.checked = fsUtil.string(filter.checked);
							filter.unchecked = fsUtil.string(filter.unchecked);
							filter.default = filter.default===undefined ? filter.unchecked : fsUtil.string(filter.default);

						} else if(filter.type=='text') {

							if(!primary) {
								filter.primary = primary = true;
							}

						} else if(filter.type=='range') {

							if(!filter.placeholder) {
								filter.placeholder = ['Min','Max'];
							}

						} else if(filter.type=='select') {

							filter.values = values;
							filter.groups = null;

							var values = [];
							if(filter.nested) {
								//generate a list of values from objects that have not been nested.
								if(!filter.multiple)
									values.push({ value:'__all', name:'All', depth: 0 });

								Array.prototype.push.apply(values, walkSelectNestedValues(filter, null, filter.values));
							} else {
								values = walkSelectValues(filter, filter.values);
							}

							filter.values = values;

							if(filter.isolate) {

								angular.forEach(filter.values,function(item, index) {
									if(item.value==filter.isolate.value) {
										filter.values.splice(index,1);
									}
								});

								if(fsUtil.isArray(filter.model)) {
									if(filter.model.length==filter.values.length) {
										filter.model = null;
										filter.isolate.enabled = false;
									} else if(filter.model[0]==filter.isolate.value) {
										filter.isolate.enabled = true;
									}
								}
							}

							angular.forEach(filter.values,function(value) {
								if(value.group) {

									if(!filter.groups) {
										filter.groups = {};
									}

									if(!filter.groups[value.group]) {
										filter.groups[value.group] = [];
									}

									filter.groups[value.group].push(value);
								}
							});
						}

						if(filter.model===undefined) {
							filter.model = filter.default;
						}

						if(filter.query || filter.value) {

							if(filter.value!==undefined) {
								filter.model = filter.value;
							} else {

								if(fsArray.keyExists($location.search(),filter.query)) {

									var query = fsUtil.string($location.search()[filter.query]);

									if(query.length) {
										filter.model = query;
									} else {
										filter.model = undefined;
									}
								}
							}

							if(filter.type=='select' && filter.multiple) {

								if(fsUtil.isString(filter.model)) {
									filter.model = filter.model.split(',');
								}

								if(filter.model!==undefined && !fsUtil.isArray(filter.model)) {
									filter.model = [filter.model];
								}

							} else if(fsUtil.isString(filter.model)) {
								if(filter.type=='daterange' || filter.type=='datetimerange') {
									var parts = filter.model.split(',');
                  filter.model = { from: moment(parts[0]), to: moment(parts[1]) };
                } else if(filter.type=='date') {
                  filter.model = moment(filter.model);
                } else if(filter.type=='range') {
									var parts = filter.model.split(',');
									filter.model = { min: parts[0], max: parts[1] };
								}
							}
						}

						if(filter.model===undefined) {

							if(filter.type=='checkbox') {
								filter.model = filter.unchecked;

							} else if(filter.type=='select') {

								if(filter.multiple) {
									if(!angular.isArray(filter.default)) {
										filter.model = [];
									}
								} else {
									if(filter.default===undefined) {
										filter.model = '__all';
									}
								}
							} else if(filter.type=='autocompletechips') {
								filter.model = [];
							}
						}

						if(filter.change) {
							filter.change = angular.bind(filter,filter.change, options.instance);
						}

					});

					return promise;
				}

				//preload any filters which have filter.wait.  Once they are all loaded then proceed to load main data & rest of filters.
				var wait_promises = [], update_promises = [];
				angular.forEach(options.filters,function(filter) {

					var promise = sanitizeFilter(filter);
					if(filter.wait || (filter.type=='select' && filter.isolate && filter.wait===undefined)) {
						wait_promises.push(promise);
					} else {
						update_promises.push(promise);
					}
				});

				$q.all(wait_promises)
				.then(function() {

					if(options.savedFilter) {
						var item = fsArray.filter(options.savedFilter.filters,{ active: true })[0];
						if(item) {
							//Avoids the search input populating with blank values. Have to wait for the promises to finish
							$scope.searchinput.value = '';
							instance.filter.saved.select(item);
							options.load = false;
						}
					}

					//load main data
					if(options.load) {
						reload({ searchUpdate: false });
					}

					//This promise is needed because the all the select filter values
					//have to be loaded to render the textual inputs
					$q.all(update_promises)
					.then(function() {
						if(options.init) {
							options.init();
						}
						searchUpdate();
					});
				});

				function data() {

					if(!arguments.length)
						return $scope.data;

					callback(arguments[0], {});

					return this;
				}

				if($scope.instance) {
					angular.extend($scope.instance,instance);
				}

				if(!$scope.options.instance)
					$scope.options.instance = {};

				angular.extend($scope.options.instance,instance);

				if($scope.options.id) {
					fsLister.add($scope.options.id,instance);
				}
			}],
			link: function($scope, element, attr, ctrl) {

				var height,
					el_bottom,
					wn_bottom,
					scrollTop,
					condition,
					threshhold = 200,
					container = $scope.options.container ? document.querySelector($scope.options.container) : window,
					element = angular.element(element[0].children[0]);

				$scope.max_bottom = 0;
				$scope.resize = function(opts) {

					if($scope.options && $scope.options.paging && $scope.options.paging.infinite) {

						if(!$scope.loading && $scope.data.length) {

							height 		= parseInt(container.innerHeight || container.clientHeight);
							el_bottom 	= parseInt(element.prop('offsetHeight')) + parseInt(element.prop('offsetTop'));
							scrollTop 	= Math.max(container.scrollTop || 0,container.pageYOffset || 0);
							wn_bottom 	= scrollTop + height;
							condition 	= (el_bottom - threshhold) <= wn_bottom && (el_bottom > ($scope.max_bottom + threshhold));

							/*
							if($scope.options.debug) {
								var body = document.body,
									html = document.documentElement;

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
							*/

							if(condition) {
								$scope.max_bottom = el_bottom;
								$scope.load(opts);
							}
						}
					}
				}

				if($scope.options && $scope.options.paging && $scope.options.paging.infinite) {

					container.addEventListener('scroll', $scope.resize);
					container.addEventListener('resize', $scope.resize);

					$scope.$on('$destroy', function() {
						container.removeEventListener('scroll', $scope.resize);
						container.removeEventListener('resize', $scope.resize);
					});
				}
			}

		}
	}];

	angular.module('fs-angular-lister',['fs-angular-store','angular-sortable-view','fs-angular-array',
										'fs-angular-util','fs-angular-datetime','fs-angular-modal','fs-angular-alert'])
	.directive('lister',ListerDirective)
	.directive('fsLister',ListerDirective)
	.directive('fsListerCompile', ['$compile', '$injector', '$location', '$timeout', '$rootScope',
									function ($compile, $injector, $location, $timeout, $rootScope) {
		return {    scope: {
						column: '=',
						data: '=',
						locals: '=',
						value: '=fsListerCompile',
						$index: '=?index'
					},
					link: function($scope, element, attrs, ctrl) {

						var scope = $scope;

						if($scope.column.scope) {
							angular.extend($scope,$scope.column.scope);
						}

						$scope.$watch('locals',function () {
							angular.extend(scope,$scope.locals);
						});

						if($scope.column.resolve && $scope.data) {
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
	.directive('fsListerGroupCompile', ['$compile',function ($compile) {
		return {    scope: {
						group: '=',
						data: '=',
						col: '='
					},
					link: function($scope, element) {

						if($scope.group.scope) {
							$scope = angular.extend({},$scope,$scope.group.scope);
						}

						element.html($scope.col);
						$compile(element.contents())($scope);
					}
		}
	}])
	.directive('fsListerFooterCompile', ['$compile',function ($compile) {
		return {    scope: {
						column: '=',
						style: '=',
						locals: '='
					},
					link: function($scope, element, attrs, ctrl) {

						$scope.$watch('locals',function () {
							angular.extend($scope,$scope.locals);
						});

						$scope.style = {};
						var footer = $scope.column.footer;
						if(footer) {

							if(footer.scope) {
								angular.extend($scope,footer.scope);
							}

							$scope.style = footer.style || {};

							if(footer.center || footer.right) {
								$scope.style.textAlign = footer.center ? 'center' : 'right';
							}

							var value = footer.value;
							if (typeof value == 'function') {
								value = value();
							}

							element.html(value);
							$compile(element.contents())($scope);
						}
					}
		}
	}])
	.filter('fsListerHeaderStyles',function() {
		return function(col) {
			var styles = col.header ? col.header.styles : {};
			return angular.extend({ width: col.width }, styles || {});
		};
	})
	.directive('fsListerTopactionCompile', ['$compile','$rootScope',function ($compile, $rootScope) {
		return {    scope: {
						scope: '=?',
						template: '=fsListerTopactionCompile'
					},
					link: function($scope, element, attrs, ctrl) {

						$scope.$watch('scope',function () {
							angular.extend($scope,$scope.scope);
						});

						element.html($scope.template);
						$compile(element.contents())($scope);
					}
		}
	}])
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
	})
	.controller('listerSavedFiltersCtrl',function($scope, options, fsUtil, fsArray, mode, fsModal) {

		options.savedFilter.filters = options.savedFilter.filters || [];

		$scope.mode = mode;
		$scope.filter = {};

		if(mode=='save') {
			$scope.savedFilters = options.savedFilter.filters;
		}

		if(options.savedFilter.active) {
			$scope.filter = options.savedFilter.active;
		}

		$scope.save = function() {

			if($scope.mode=='save') {

				if($scope.filter=='new') {
					$scope.filter = { 	guid: fsUtil.guid(),
										name: $scope.name };
					options.savedFilter.filters.push($scope.filter);
				}

				$scope.filter.values = options.instance.filter.value.gets();
			}

			options.savedFilter.active = $scope.filter;
			change($scope.filter);
			fsModal.hide();
		}

		function change(filter) {
			if(options.savedFilter.change) {
				options.savedFilter.change(filter);
			}
		}

		$scope.lsOptions ={
			paging: false,
			data: function(query, cb) {
				cb(options.savedFilter.filters);
			},
			columns: [
				{
					title: 'Name',
					value: '<a href ng-click="edit(data)">{{data.name}}</a>',
					scope: {
						edit: function(data) {
							$scope.filter = data;
							$scope.mode = 'update';
						}
					}
				}
			],
			sort: {
                stop: function(item,list) {
                    options.savedFilter.filters = list;
					change(item);
				}
            },
			actions: [
				{
					label: 'Edit',
					icon: 'edit',
					click: function(data) {
						$scope.filter = data;
						$scope.mode = 'update';
					}
				},
				{
					delete: {
		                title: 'Attention',
		                content: 'Are you sure you would like to remove this saved filter?',
		                ok: function(data) {

		                	if(options.savedFilter.active==data) {
		                		options.instance.filter.saved.select(null);
		                	}

		                	fsArray.remove(options.savedFilter.filters,{ guid: data.guid });

		                	change(data);
		                }
		            }
		        }
			]
		}
	});
})();
