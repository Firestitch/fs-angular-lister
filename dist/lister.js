(function () {
	'use strict';

	/**
	 * @ngdoc directive
	 * @name fs.directives:fs-lister
	 * @restrict E
	 * @param {object} ls-options Options to configure the Lister.
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
					<li><label>more</label>Places the action in the ... menu</li>
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
	* @param {array} ls-options.columns Defines the columns for the lister
				<ul>
					<li><label>title</label>Specifies the column tile</li>
					<li><label>value</label>Is triggered when the rendering the column and is passed a data parameter which corresponds to the row's record</li>
					<li><label>className</label>A css class name that is appened to the column element</li>
					<li><label>resolve</label>Used to inject objects in the value() function and inserts the values into the $scope variable</li>
					<li><label>scope</label>Appended to the $scope object which is injected into the value() function</li>
					<li><label>order</label>Enables the column to be orderable. The value is used as the order value in the http request. ie: order=name,asc</li>
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

	var ListerDirective = [ '$compile', '$sce', '$filter', '$window', '$log', '$q', '$interval', '$mdDialog',
							'fsStore', '$rootScope', 'fsLister', '$location', '$templateCache', 'fsArray',
							function ($compile, $sce, $filter, $window, $log, $q, $interval, $mdDialog,
									fsStore, $rootScope, fsLister, $location, $templateCache, fsArray) {
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
				$scope.actionCols = [];
				$scope.options = options;
				$scope.options.orders = $scope.options.orders || [];
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
				$scope.locals = {};
				$scope.rowClasses = [];
				$scope.orderDirections = { 'asc': 'ascending', 'desc': 'descending' };

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

						} else if(filter.type=='checkbox') {
							filter.model = filter.unchecked;

						} else if(filter.type=='select') {

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

					 if(filter.type=='select') {

						if(filter.isolate) {

							if(filter.wait===undefined) {
								filter.wait = true;
							}

							if(filter.isolate.value==filter.model) {
								filter.isolate.enabled = true;
							}
						}
					}


					if(filter.change)
						filter.change = angular.bind(filter,filter.change, options.instance);

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

					options.selection.show = false;
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

						if(action.more===undefined) {
							action.more = false;
						}

						if(action.type===undefined) {
							action.type = 'button';
						}

						if(angular.isFunction(action.show)) {
							action.show = action.show();
						}
					});
				}

				if(options.order) {

					var orderName = options.order;
					var orderDirection = 'asc';

					if(angular.isObject(options.order)) {
						orderName = options.order.name;
						orderDirection = options.order.direction || 'asc';
					}

					var order = $filter('filter')($scope.options.orders,{ name: orderName },true)[0];
					if(order) {
						$scope.order = angular.copy(order);
						$scope.order.direction = orderDirection;
					}
				}

				if(!$scope.order) {
					var order = $filter('filter')($scope.options.orders,{ column: true, default: true },true)[0];
					$scope.order = angular.copy(order);
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
						$scope.order.label = col.order.label;

						reload();
					}
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
											$scope.paging.records--;
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

				$scope.orderNameSelect = function(order) {
					$scope.order.name = order.name;
					$scope.order.label = order.label;
					reload();
				}

				$scope.orderDirectionToggle = function() {
					$scope.order.direction = $scope.order.direction=='asc' ? 'desc' : 'asc';
					reload();
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

					click(selected, $event, $scope.instance);
				}

				$scope.selectionsClear = function() {
					$scope.checked = [];
					$scope.selectToogled = false;
				}

				$scope.toggleFilters = function() {
					$scope.extended_search = !$scope.extended_search;
				}

				$scope.openFilters = function(event) {
					$scope.extended_search = true;
				}

				$scope.done = function() {
					$scope.extended_search = false;
				}

				$scope.selectOpen = function(filter) {
					filter.oldModel = angular.copy(filter.model);
				}

				$scope.selectSearch = function(filter) {

					if(!angular.equals(filter.model,filter.oldModel)) {

						if(filter.isolate) {
							filter.isolate.enabled = false;

							if(filter.multiple) {
								var index = filter.model.indexOf(filter.isolate.value);

								if(index > -1) {
									filter.model.splice(index,1);
								}
							}
						}

						$scope.search(filter);
					}
				}

				$scope.dateSearch = function(filter) {
					$scope.search(filter);
				}

				$scope.topActionsClick = function(action,$event) {
					if(action.click) {
						action.click(filterValues(), $event, $scope.instance);
					}
				}

				$scope.isolateSearch = function(filter) {

					if(filter.isolate.enabled) {
						filter.model = filter.multiple ? [filter.isolate.value] : filter.isolate.value;
					} else {
						filter.model = null;
					}

					$scope.search(filter);
				}

				$scope.search = function(filter) {
					$scope.filterValueUpdate();

					if(filter.change)
						filter.change();

					$scope.searchInputUpdate();
					reload();
				}

				$scope.filterValueUpdate = function() {

					angular.forEach(options.filters,function(filter) {
						$scope.filterValue(filter);
					});
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

								value = moment(value).format('MMM D, YYYY');

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

					var matches = search.match(/(\([^\)]+\):\([^\)]+\)|\([^\)]+\):[^\s]+|[^:]+:\([^\)]+\)|[^\s]+)/g);

					var values = {};
					var textSearch = [];
					angular.forEach(matches, function(match) {

						var filter_match = match.match(/\(?([^:\)]+)\)?:\(?([^)]+)/);

						if(filter_match) {
							values[filter_match[1].trim()] = filter_match[2];
						} else {
							textSearch.push(match);
						}
					});

					angular.forEach(options.filters,function(filter) {
						if (filter.type == 'checkbox') {
							filter.model = filter.unchecked;
							filter.value = filter.unchecked;
						} else if(textSearch.length && filter.primary && filter.type=='text') {
							filter.model = textSearch.join(' ');
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
								} else {
									filter.value = filter.model;
								}

							} else if(filter.model!='__all')  {
								filter.value = filter.model;
							}
						}

					} else if(filter.type=='date') {

						var date = filter.model;

						if(date) {
							filter.value = moment(date).format();
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

				function walkSelectValues(filter, values) {
					var prepped_values = [];

					angular.forEach(values, function(obj,key) {
						var value = { value: key, name: obj };

						if(typeof obj=='object') {
							value = obj;
						}

						if(value.value===null) {
							value.value = 'null';
						}

						prepped_values.push(value);
					});

					return prepped_values;
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
					return load({ page: 1, clear: true });
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

				function filterValues() {
					var query = {};
					angular.forEach(options.filters,function(filter) {

						if(filter.value!==null && filter.value!==undefined && String(filter.value).length) {
							query[filter.name] = filter.value;
						}

						if(filter.isolate && !filter.isolate.enabled) {

							if(!filter.model || filter.model=='__all' || (angular.isArray(filter.model) && !filter.model.length)) {
								var values = [];
								angular.forEach(filter.values,function(value, index) {
									if(angular.isObject(value)) {
										if(value.value=='__all' || value.value==filter.isolate.value)
											return;

										values.push(value.value);

									} else {
										if(index=='__all' || index==filter.isolate.value)
											return;

										values.push(index);
									}
								});
								query[filter.name] = values.join(',');
							}
						}


						//if we have a model but no value yet (because of persist) use the model
						if(filter.model && typeof filter.value == 'undefined') {
							if(angular.isArray(filter.model)) {
								if(filter.model.length > 0)
									query[filter.name] = filter.model.join(',');
							} else if(filter.model!=="__all") {
								query[filter.name] = filter.model;
							}
						}
					});

					return query;
				}


				function clearData() {
					dataIndex = 0;
					$scope.data = [];
					$scope.dataCols = [];
					$scope.actionCols = [];
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

					if(opts.clear)
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

					try {

						$scope.loading = true;

						if(options.data) {

							var response = options.data(query,angular.bind(this,dataCallback,opts));

							if(response && response.then) {

								response
								.then(function(response) {
									dataCallback(opts,response.data,response.paging,response.locals);
								})
								.catch(function(response) {
									loadCleanup();
								});
							}
						}

				   } catch(e) {
						loadCleanup();
						throw e;
					}
				}

				function dataCallback(opts, data, paging, locals) {

					log("dataCallback()", data, paging, locals);

					if(opts.clear) {
						$scope.max_bottom = 0;
						clearData();
					}

					callback(data, paging, locals);
				}

				function loadCleanup() {
					 $scope.loading = false;
				}

				function page(page) {
					$scope.paging.page = page;
					load();
				}

				function callback(data, paging, locals) {

					if(!$scope.options.paging.infinite) {
						clearData();
					}

					if(locals) {
						angular.extend($scope.locals,locals);
						$scope.locals = locals;
					}

					var ol = data.length;
					for (var o = 0; o < ol; o++) {

						var cl = options.columns.length;
						var cols = [];

						for (var c = 0; c < cl; c++) {

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

					loadCleanup();
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



				function prep_filter(filter) {
					if(typeof filter.values=='function') {
						filter.values = filter.values();
					}

					var promise = $q(function(resolve,reject) {

						if(angular.isObject(filter.values) && filter.values.then) {

							filter.values
							.then(function(values) {
								resolve(values);
							});

						} else {
							resolve(filter.values);
						}

					}).then(function(values) {

						filter.values = values;
						filter.groups = null;

						if(filter.type=='select') {

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
						}

						var valuename = true;
						angular.forEach(filter.values,function(value) {
							valuename &= !!value.value;
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

					return promise;
				}


				//preload any filters which have filter.wait.  Once they are all loaded then proceed to load main data & rest of filters.
				var preload_promises = [];
				angular.forEach($scope.options.filters,function(filter, index) {
					if(typeof filter.values=='function' && filter.wait) {
						preload_promises.push(prep_filter(filter));
					}
				});

				$q.all(preload_promises)
				.then(function() {

					//load main data
					if(options.load) {
						reload();
					}

					//load rest of filters
					var promises = [];
					angular.forEach($scope.options.filters,function(filter, index) {
						var promise = prep_filter(filter);
						promises.push(promise);
					});


					//This promise is needed because the all the select filter values
					//have to be loaded to render the textual inputs
					$q.all(promises)
					.then(function() {
						$scope.filterValueUpdate();
						$scope.searchInputUpdate();

						if(options.init)
							options.init();

					});

				});


				function data() {

					if(!arguments.length)
						return $scope.data;

					callback(arguments[0], {});

					return this;
				}

				function locals() {

					if(!arguments.length)
						return $scope.locals;

					if(arguments.length==1)
						return $scope.locals[arguments[0]];

					if(arguments.length==2) {
						$scope.locals[arguments[0]] = arguments[1];
						$scope.locals = angular.copy($scope.locals);
					}

					return this;
				}

				var instance = {load: load,
								page: page,
								reload: reload,
								filterValues: filterValues,
								data: data,
								locals: locals,
								find: function(filters) {
									var flen = filters.length;
									var len = $scope.data.length;
									for(var i=0; i<len; i++) {

										var valid = true;
										angular.forEach(filters,function(value,name) {
											if(!valid || $scope.data[i][name]!==value)
												valid = false;
										});

										if(valid) {
											return $scope.data[i];
										}
									}

									return undefined;
								},
								filter: function(name) {
									return fsArray.filter(options.filters, {name:name})[0];
								},
								update: function(object,filters) {

									var item = this.find(filters);

									if(item) {
										angular.extend(item,object);
									} else {
										this.reload();
									}
								},
								option: function(option,name,value) {
									if(option=='filter') {
										var filter = $filter('filter')(options.filters,{ name: name },true)[0];

										if(2 in arguments && filter) {

											filter.model = arguments[2];
											if (moment.isMoment(filter.model)) {
												filter.model = filter.model.toDate();
											}

											$scope.filterValueUpdate();
											$scope.searchInputUpdate();
										}

										return filter;
									}
								},
								options: function() {
									if(arguments.length==1) {
										return options[arguments[0]];
									}

									if(arguments.length==2) {
										return options[arguments[0]] = arguments[1];
									}

									return options;
								}};

				if($scope.instance) {
					angular.extend($scope.instance,instance);
				}

				if(!$scope.options.instance)
					$scope.options.instance = {};

				angular.extend($scope.options.instance,instance);
			}],
			link: function($scope, element, attr, ctrl) {

				$scope.max_bottom = 0;
				if($scope.options && $scope.options.paging && $scope.options.paging.infinite) {

					element = angular.element(element[0].children[0]);

					var height,
						el_bottom,
						wn_bottom,
						scrollTop,
						condition,
						threshhold = 200;

					var container = $scope.options.container ? document.querySelector($scope.options.container) : null;

					var timeout = $interval(function() {

						if(!$scope.loading && $scope.data.length) {

							height = container ? container.clientHeight : window.innerHeight;
							scrollTop = container ? parseInt(container.scrollTop) : $window.pageYOffset;
							el_bottom = (parseInt(element.prop('offsetHeight')) + parseInt(element.prop('offsetTop')));
							wn_bottom = scrollTop + parseInt(height);
							condition = (el_bottom - threshhold) <= wn_bottom && (el_bottom > ($scope.max_bottom + threshhold));

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

							if(condition) {
								$scope.max_bottom = el_bottom;
								$scope.load();
							}
						}
					},400);

					$scope.$on('$destroy', function() {
						$interval.cancel(timeout);
					});
				}
			}

		}
	}];

	angular.module('fs-angular-lister',['fs-angular-store','angular-sortable-view','fs-angular-array'])
	.directive('lister',ListerDirective)
	.directive('fsLister',ListerDirective)
	.directive('fsListerCompile', ['$compile', '$injector', '$location', '$timeout', '$rootScope',
									function ($compile, $injector, $location, $timeout, $rootScope) {
		return {    scope: {
						column: '=',
						data: '=',
						locals: '=',
						value: '=fsListerCompile'
					},
					link: function($scope, element, attrs, ctrl) {

						var scope = $scope;

						if($scope.column.scope) {
							angular.extend($scope,$scope.column.scope);
						}

						$scope.$watch('locals',function () {
							angular.extend(scope,$scope.locals);
						});

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
	.directive('fsListerFooterCompile', ['$compile','$rootScope',function ($compile, $rootScope) {
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
    "<div class=\"lister\" ng-class=\"{ loading: loading, infinite: options.paging.infinite, paged: !options.paging.infinite }\">\r" +
    "\n" +
    "\r" +
    "\n" +
    "    <div class=\"lister-search\" ng-show=\"options.filters.length || options.topActions\">\r" +
    "\n" +
    "        <div layout=\"row\" layout-align=\"start\" ng-if=\"options.filters.length\" layout-align=\"start end\">\r" +
    "\n" +
    "            <div layout=\"row\" layout-align=\"start center\" class=\"inline-search\" flex>\r" +
    "\n" +
    "                <div class=\"inline-search-input\" flex=\"grow\">\r" +
    "\n" +
    "                    <div class=\"main-search-bar\" layout=\"row\" layout-align=\"start center\">\r" +
    "\n" +
    "                        <div class=\"search\"><i class=\"material-icons\">search</i></div>\r" +
    "\n" +
    "                        <md-input-container class=\"md-no-label md-no-message\">\r" +
    "\n" +
    "                            <input ng-model=\"searchinput.value\" ng-model-options=\"{debounce: 400}\" ng-change=\"searchChange(searchinput.value)\" ng-click=\"openFilters()\" ng-keydown=\"searchKeydown($event)\" aria-label=\"Search\" placeholder=\"Search\" autocomplete=\"off\" />\r" +
    "\n" +
    "                        </md-input-container>\r" +
    "\n" +
    "                        <a href ng-click=\"reload()\" class=\"reload\"><i class=\"material-icons\">refresh</i></a>\r" +
    "\n" +
    "                    </div>\r" +
    "\n" +
    "\r" +
    "\n" +
    "                    <div class=\"ng-hide filters\" layout=\"column\" ng-show=\"extended_search\">\r" +
    "\n" +
    "                        <div class=\"wrap\">\r" +
    "\n" +
    "                            <div ng-repeat=\"filter in options.filters\" class=\"filter-group\" ng-if=\"!filter.disabled\">\r" +
    "\n" +
    "\r" +
    "\n" +
    "                                <div class=\"filter filter-{{filter.type}}\">\r" +
    "\n" +
    "\r" +
    "\n" +
    "                                    <div class=\"filter-label\">\r" +
    "\n" +
    "                                        <div class=\"filter-label-content\">\r" +
    "\n" +
    "                                            {{::filter.label}}\r" +
    "\n" +
    "                                        </div>\r" +
    "\n" +
    "                                    </div>\r" +
    "\n" +
    "\r" +
    "\n" +
    "                                    <div class=\"interface\" ng-if=\"filter.type == 'select'\">\r" +
    "\n" +
    "                                        <md-input-container class=\"md-no-float md-no-label md-no-message\" ng-show=\"filter.multiple && !filter.groups\">\r" +
    "\n" +
    "                                            <md-select ng-model=\"filter.model\" aria-label=\"select\" multiple=\"filter.multiple\" md-on-open=\"selectOpen(filter)\" md-on-close=\"selectSearch(filter)\">\r" +
    "\n" +
    "                                                <md-option ng-repeat=\"item in filter.values\" value=\"{{::item.value}}\" ng-style=\"item.style\">\r" +
    "\n" +
    "                                                    {{::item.name}}\r" +
    "\n" +
    "                                                </md-option>\r" +
    "\n" +
    "                                            </md-select>\r" +
    "\n" +
    "                                        </md-input-container>\r" +
    "\n" +
    "\r" +
    "\n" +
    "                                        <md-input-container class=\"md-no-float md-no-label md-no-message\" ng-show=\"!filter.multiple && !filter.groups\">\r" +
    "\n" +
    "                                            <md-select ng-model=\"filter.model\" aria-label=\"select\" md-on-open=\"selectOpen(filter)\" ng-change=\"selectSearch(filter,filter.model)\">\r" +
    "\n" +
    "                                                <md-option ng-repeat=\"item in filter.values\" value=\"{{::item.value}}\" ng-style=\"item.style\">\r" +
    "\n" +
    "                                                    {{::item.name}}\r" +
    "\n" +
    "                                                </md-option>\r" +
    "\n" +
    "                                            </md-select>\r" +
    "\n" +
    "                                        </md-input-container>\r" +
    "\n" +
    "\r" +
    "\n" +
    "                                        <md-input-container class=\"md-no-float md-no-label md-no-message\" ng-show=\"!filter.multiple && filter.groups\">\r" +
    "\n" +
    "                                            <md-select ng-model=\"filter.model\" aria-label=\"select\" md-on-open=\"selectOpen(filter)\" ng-change=\"selectSearch(filter)\">\r" +
    "\n" +
    "                                                <md-optgroup label=\"{{group}}\" ng-repeat=\"(group, values) in filter.groups\">\r" +
    "\n" +
    "                                                    <md-option ng-repeat=\"item in values\" value=\"{{::item.value}}\" ng-style=\"item.style\">\r" +
    "\n" +
    "                                                        {{::item.name}}\r" +
    "\n" +
    "                                                    </md-option>\r" +
    "\n" +
    "                                                </md-optgroup>\r" +
    "\n" +
    "                                            </md-select>\r" +
    "\n" +
    "                                        </md-input-container>\r" +
    "\n" +
    "\r" +
    "\n" +
    "                                        <md-input-container class=\"md-no-float md-no-label md-no-message\" ng-show=\"filter.multiple && filter.groups\">\r" +
    "\n" +
    "                                            <md-select ng-model=\"filter.model\" aria-label=\"select\" multiple=\"filter.multiple\" md-on-open=\"selectOpen(filter)\" md-on-close=\"selectSearch(filter)\">\r" +
    "\n" +
    "                                                <md-optgroup label=\"{{group}}\" ng-repeat=\"(group, values) in filter.groups\">\r" +
    "\n" +
    "                                                    <md-option ng-repeat=\"item in values\" value=\"{{::item.value}}\" ng-style=\"item.style\">\r" +
    "\n" +
    "                                                        {{::item.name}}\r" +
    "\n" +
    "                                                    </md-option>\r" +
    "\n" +
    "                                                </md-optgroup>\r" +
    "\n" +
    "                                            </md-select>\r" +
    "\n" +
    "                                        </md-input-container>\r" +
    "\n" +
    "                                    </div>\r" +
    "\n" +
    "\r" +
    "\n" +
    "                                    <div class=\"interface\" ng-if=\"filter.type == 'text'\">\r" +
    "\n" +
    "                                        <md-input-container class=\"md-no-float md-no-label md-no-message\">\r" +
    "\n" +
    "                                            <input ng-model=\"filter.model\" aria-label=\"{{::filter.label}}\" ng-model-options=\"{debounce: 400}\" ng-keydown=\"searchKeydown($event, 'closePopupOnEnter')\" ng-change=\"search(filter)\"/>\r" +
    "\n" +
    "                                        </md-input-container>\r" +
    "\n" +
    "                                    </div>\r" +
    "\n" +
    "\r" +
    "\n" +
    "                                    <div class=\"interface\" ng-if=\"filter.type == 'range'\" >\r" +
    "\n" +
    "\r" +
    "\n" +
    "                                        <span layout=\"row\" class=\"md-block\">\r" +
    "\n" +
    "\r" +
    "\n" +
    "                                             <md-input-container class=\"md-no-label md-no-message md-block filter-range-min\">\r" +
    "\n" +
    "\r" +
    "\n" +
    "                                                <label>{{::filter.label}}</label>\r" +
    "\n" +
    "                                                <input\r" +
    "\n" +
    "                                                    placeholder=\"{{::filter.placeholder[0]}}\"\r" +
    "\n" +
    "                                                    ng-model=\"filter.model['min']\"\r" +
    "\n" +
    "                                                    aria-label=\"{{::filter.label}}\"\r" +
    "\n" +
    "                                                    ng-model-options=\"{debounce: 400}\"\r" +
    "\n" +
    "                                                    ng-change=\"search(filter)\" />\r" +
    "\n" +
    "                                             </md-input-container>\r" +
    "\n" +
    "\r" +
    "\n" +
    "\r" +
    "\n" +
    "                                             <md-input-container class=\"md-no-label md-no-message md-block filter-range-max\">\r" +
    "\n" +
    "\r" +
    "\n" +
    "                                                <label>{{::filter.label}}</label>\r" +
    "\n" +
    "                                                <input\r" +
    "\n" +
    "                                                    placeholder=\"{{::filter.placeholder[1]}}\"\r" +
    "\n" +
    "                                                    ng-model=\"filter.model['max']\"\r" +
    "\n" +
    "                                                    aria-label=\"{{::filter.label}}\"\r" +
    "\n" +
    "                                                    ng-model-options=\"{debounce: 400}\"\r" +
    "\n" +
    "                                                    ng-change=\"search(filter)\" />\r" +
    "\n" +
    "                                             </md-input-container>\r" +
    "\n" +
    "                                        </span>\r" +
    "\n" +
    "                                    </div>\r" +
    "\n" +
    "\r" +
    "\n" +
    "                                    <div class=\"interface\" ng-if=\"filter.type == 'date'\" >\r" +
    "\n" +
    "\r" +
    "\n" +
    "                                        <span class=\"md-block\">\r" +
    "\n" +
    "                                            <md-datepicker-container class=\"md-no-label md-no-message md-block\">\r" +
    "\n" +
    "                                                <label>{{::filter.label}}</label>\r" +
    "\n" +
    "                                                <md-datepicker ng-model=\"filter.model\" ng-change=\"dateSearch(filter)\" md-open-on-focus></md-datepicker>\r" +
    "\n" +
    "                                            </md-datepicker-container>\r" +
    "\n" +
    "                                        </span>\r" +
    "\n" +
    "                                    </div>\r" +
    "\n" +
    "\r" +
    "\n" +
    "                                    <div class=\"interface interface-checkbox\" ng-if=\"filter.type == 'checkbox'\">\r" +
    "\n" +
    "                                        <md-checkbox ng-change=\"search(filter)\" ng-model=\"filter.model\" ng-true-value=\"'{{filter.checked}}'\" ng-false-value=\"'{{filter.unchecked}}'\" aria-label=\"Checkbox filter\"></md-checkbox>\r" +
    "\n" +
    "                                    </div>\r" +
    "\n" +
    "\r" +
    "\n" +
    "                                </div>\r" +
    "\n" +
    "\r" +
    "\n" +
    "                                <div ng-if=\"filter.isolate\" class=\"filter isolate\">\r" +
    "\n" +
    "\r" +
    "\n" +
    "                                    <div class=\"filter-label\"></div>\r" +
    "\n" +
    "\r" +
    "\n" +
    "                                    <div class=\"interface\">\r" +
    "\n" +
    "                                        <md-checkbox ng-change=\"isolateSearch(filter)\" ng-model=\"filter.isolate.enabled\" ng-true-value=\"true\" ng-false-value=\"false\" aria-label=\"Checkbox filter\"></md-checkbox>\r" +
    "\n" +
    "                                        {{filter.isolate.label}}\r" +
    "\n" +
    "                                    </div>\r" +
    "\n" +
    "                                </div>\r" +
    "\n" +
    "                            </div>\r" +
    "\n" +
    "\r" +
    "\n" +
    "                            <md-button class=\"md-button md-raised md-accent search-button\" ng-click=\"done()\">Done</md-button>\r" +
    "\n" +
    "                        </div>\r" +
    "\n" +
    "                    </div>\r" +
    "\n" +
    "                </div>\r" +
    "\n" +
    "\r" +
    "\n" +
    "\r" +
    "\n" +
    "\r" +
    "\n" +
    "                <!--\r" +
    "\n" +
    "                <md-button ng-click=\"toggleFilters()\" md-no-ink class=\"md-icon-button md-icon-button-filters\" aria-label=\"Search filters\">\r" +
    "\n" +
    "                    <div class=\"material-icons icon-collapsed\" ng-show=\"extended_search\">expand_more</div>\r" +
    "\n" +
    "                    <div class=\"material-icons icon-expanded\" ng-show=\"!extended_search\">chevron_right</div>\r" +
    "\n" +
    "                </md-button>\r" +
    "\n" +
    "                -->\r" +
    "\n" +
    "                <div class=\"backdrop\" ng-show=\"extended_search\" ng-click=\"toggleFilters()\"></div>\r" +
    "\n" +
    "            </div>\r" +
    "\n" +
    "\r" +
    "\n" +
    "            <div class=\"top-actions\" ng-if=\"options.topActions.length\">\r" +
    "\n" +
    "                <span ng-repeat=\"action in options.topActions | filter: { more: false }\">\r" +
    "\n" +
    "                \t<md-button ng-show=\"action.show && action.type=='button'\" ng-click=\"topActionsClick(action,$event)\" class=\"md-raised\" ng-class=\"{ 'md-accent': action.primary!==false }\">{{action.label}}</md-button>\r" +
    "\n" +
    "\r" +
    "\n" +
    "                \t<span ng-show=\"action.show && action.type=='template'\" fs-lister-topaction-compile=\"action.template\" scope=\"action.scope\"></span>\r" +
    "\n" +
    "                </span>\r" +
    "\n" +
    "                <md-menu ng-if=\"(options.topActions | filter:{ more: true }).length > 0\">\r" +
    "\n" +
    "                    <md-button ng-click=\"$mdOpenMenu($event)\" class=\"md-icon-button more\">\r" +
    "\n" +
    "                        <md-icon>more_vert</md-icon>\r" +
    "\n" +
    "                    </md-button>\r" +
    "\n" +
    "                    <md-menu-content>\r" +
    "\n" +
    "                        <md-menu-item ng-repeat=\"action in options.topActions\" ng-if=\"action.more\" ng-show=\"action.show\">\r" +
    "\n" +
    "                            <md-button ng-click=\"action.click($event)\">\r" +
    "\n" +
    "                                <md-icon ng-if=\"action.icon\">{{::action.icon}}</md-icon>\r" +
    "\n" +
    "                                {{::action.label}}\r" +
    "\n" +
    "                            </md-button>\r" +
    "\n" +
    "                        </md-menu-item>\r" +
    "\n" +
    "                    </md-menu-content>\r" +
    "\n" +
    "                </md-menu>\r" +
    "\n" +
    "            </div>\r" +
    "\n" +
    "        </div>\r" +
    "\n" +
    "        <div class=\"infinite-records\">\r" +
    "\n" +
    "            <span ng-if=\"numeric(paging.records) && paging.records>=0\">{{paging.records}} results<span ng-show=\"order.name\"> ordered by</span></span>\r" +
    "\n" +
    "            <span ng-if=\"(!numeric(paging.records) || paging.records<0) && order.name\">Ordered by</span>\r" +
    "\n" +
    "            <md-menu ng-show=\"order.name\">\r" +
    "\n" +
    "                <a href ng-click=\"$mdOpenMenu($event)\" class=\"order-toggle\">{{order.label}}</a>,\r" +
    "\n" +
    "                <md-menu-content>\r" +
    "\n" +
    "                    <md-menu-item ng-repeat=\"order in options.orders\">\r" +
    "\n" +
    "                        <md-button ng-click=\"orderNameSelect(order)\">\r" +
    "\n" +
    "                            {{order.label}}\r" +
    "\n" +
    "                        </md-button>\r" +
    "\n" +
    "                    </md-menu-item>\r" +
    "\n" +
    "                </md-menu-content>\r" +
    "\n" +
    "            </md-menu>\r" +
    "\n" +
    "\r" +
    "\n" +
    "            <a href ng-show=\"order.name\" ng-click=\"orderDirectionToggle($event)\" class=\"order-toggle\">{{orderDirections[order.direction]}}</a>\r" +
    "\n" +
    "        </div>\r" +
    "\n" +
    "    </div>\r" +
    "\n" +
    "    <div class=\"results\" ng-if=\"options.columns.length\">\r" +
    "\n" +
    "        <div class=\"progress-paged ng-hide\" ng-show=\"loading && !options.paging.infinite\">\r" +
    "\n" +
    "            <md-progress-circular md-diameter=\"40\" md-mode=\"indeterminate\"></md-progress-circular>\r" +
    "\n" +
    "        </div>\r" +
    "\n" +
    "        <div class=\"lister-table\">\r" +
    "\n" +
    "            <div class=\"lister-head\">\r" +
    "\n" +
    "                <div class=\"lister-row\">\r" +
    "\n" +
    "                    <div class=\"lister-col lister-col-header\" ng-if=\"options.sort\"></div>\r" +
    "\n" +
    "                    <div class=\"lister-col lister-col-header lister-select-toogle\" ng-if=\"options.selection.show\">\r" +
    "\n" +
    "\r" +
    "\n" +
    "                        <md-checkbox ng-click=\"selectionsToggle(selectToogled);\" ng-model=\"selectToogled\"  ng-true-value=\"true\" aria-label=\"Toggle Selection\" class=\"select-checkbox\"></md-checkbox>\r" +
    "\n" +
    "                        <md-menu md-offset=\"6 32\">\r" +
    "\n" +
    "                            <md-button aria-label=\"Select\" class=\"md-icon-button\" ng-click=\"$mdOpenMenu($event)\">\r" +
    "\n" +
    "                                <md-icon>arrow_drop_down</md-icon>\r" +
    "\n" +
    "                            </md-button>\r" +
    "\n" +
    "                            <md-menu-content>\r" +
    "\n" +
    "                                <md-menu-item ng-repeat=\"action in options.selection.actions\" ng-if=\"action.show\">\r" +
    "\n" +
    "                                    <md-button ng-click=\"selectMenu(action.click,$event)\">\r" +
    "\n" +
    "                                        <md-icon ng-if=\"action.icon\">{{::action.icon}}</md-icon>\r" +
    "\n" +
    "                                        {{::action.label}}\r" +
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
    "                    <div class=\"lister-col lister-col-header {{::column.className}}\" ng-repeat=\"column in options.columns\" ng-style=\"styleCols[$index]\" ng-class=\"{ order: column.order }\" ng-click=\"headerClick(column)\">\r" +
    "\n" +
    "\r" +
    "\n" +
    "                        <div class=\"wrap\">\r" +
    "\n" +
    "                            <span fs-lister-compile=\"column.title\" column=\"column\" locals=\"locals\" class=\"title\"></span>\r" +
    "\n" +
    "\r" +
    "\n" +
    "                            <div class=\"direction\" ng-if=\"column.order\">\r" +
    "\n" +
    "                                <span ng-switch=\"order.direction\" ng-show=\"order.name==column.order.name\">\r" +
    "\n" +
    "                                    <md-icon ng-switch-when=\"asc\">arrow_downward</md-icon>\r" +
    "\n" +
    "                                    <md-icon ng-switch-when=\"desc\">arrow_upward</md-icon>\r" +
    "\n" +
    "                                </span>\r" +
    "\n" +
    "                            </div>\r" +
    "\n" +
    "                        </div>\r" +
    "\n" +
    "\r" +
    "\n" +
    "                    </div>\r" +
    "\n" +
    "                    <div class=\"lister-col lister-col-header\" ng-if=\"options.actions.length || options.action\">\r" +
    "\n" +
    "                    </div>\r" +
    "\n" +
    "                </div>\r" +
    "\n" +
    "            </div>\r" +
    "\n" +
    "            <div class=\"lister-body\" sv-root sv-part=\"data\" sv-on-sort=\"sortStop($item,$partTo,$indexFrom,$indexTo)\">\r" +
    "\n" +
    "                <div class=\"lister-row {{rowClasses[rowIndex]}}\" sv-element=\"{ containment:'.lister-body'}\" ng-class=\"{ selected: checked[rowIndex] }\" ng-repeat=\"item in data\" ng-click=\"options.rowClick(item,$event); $event.stopPropagation();\" ng-init=\"rowIndex = $index\">\r" +
    "\n" +
    "                    <div class=\"lister-col lister-col-sort\" ng-if=\"options.sort\"><div class=\"sort-handle\"><md-icon>drag_handle</md-icon></div></div>\r" +
    "\n" +
    "                    <div class=\"lister-col\" ng-if=\"options.selection.show\">\r" +
    "\n" +
    "                        <md-checkbox ng-model=\"checked[rowIndex]\" ng-true-value=\"1\" ng-click=\"select(item)\" aria-label=\"Select\" class=\"select-checkbox\"></md-checkbox>\r" +
    "\n" +
    "                    </div>\r" +
    "\n" +
    "                    <div class=\"lister-col {{::col.className}}\" ng-repeat=\"col in options.columns\" fs-lister-compile=\"dataCols[item.$$index][$index]\" column=\"col\" data=\"item\" locals=\"locals\" ng-style=\"styleCols[$index]\"></div>\r" +
    "\n" +
    "                    <div class=\"lister-col lister-actions\" ng-if=\"options.action\">\r" +
    "\n" +
    "                        <md-button ng-click=\"actionClick(options.action,item,$event); $event.stopPropagation();\" class=\"md-icon-button\">\r" +
    "\n" +
    "                            <md-icon class=\"material-icons\">{{::options.action.icon}}</md-icon>\r" +
    "\n" +
    "                        </md-button>\r" +
    "\n" +
    "                    </div>\r" +
    "\n" +
    "                    <div class=\"lister-col lister-actions\" ng-if=\"options.actions.length\">\r" +
    "\n" +
    "                        <md-menu ng-if=\"actionCols[item.$$index].length\">\r" +
    "\n" +
    "                            <md-button ng-click=\"$mdOpenMenu($event)\" class=\"md-icon-button\">\r" +
    "\n" +
    "                                <md-icon class=\"md-default-theme material-icons\">more_vert</md-icon>\r" +
    "\n" +
    "                            </md-button>\r" +
    "\n" +
    "                            <md-menu-content>\r" +
    "\n" +
    "                                <md-menu-item ng-if=\"actionCols[item.$$index][$index]\" ng-repeat=\"action in options.actions\">\r" +
    "\n" +
    "                                    <md-button ng-click=\"actionClick(action,item,$event)\">\r" +
    "\n" +
    "                                        <md-icon class=\"material-icons\" ng-if=\"action.icon\">{{::action.icon}}</md-icon>\r" +
    "\n" +
    "                                        {{::action.label}}\r" +
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
    "\t\t\t<div class=\"lister-foot\">\r" +
    "\n" +
    "                <div class=\"lister-row\">\r" +
    "\n" +
    "                    <div class=\"lister-col lister-col-footer\" ng-if=\"options.sort\"></div>\r" +
    "\n" +
    "                    <div class=\"lister-col lister-col-footer lister-select-toogle\" ng-if=\"options.selection.show\"></div>\r" +
    "\n" +
    "                    <div class=\"lister-col lister-col-footer {{::column.className}}\" ng-repeat=\"column in options.columns\" fs-lister-footer-compile locals=\"locals\" column=\"column\" style=\"footerStyle[$index]\" ng-style=\"footerStyle[$index]\"></div>\r" +
    "\n" +
    "                    <div class=\"lister-col lister-col-footer\" ng-if=\"options.actions.length || options.action\">\r" +
    "\n" +
    "                    </div>\r" +
    "\n" +
    "                </div>\r" +
    "\n" +
    "            </div>\r" +
    "\n" +
    "        </div>\r" +
    "\n" +
    "        <div class=\"status\" ng-if=\"(options.paging.infinite && !data.length) || (!data.length && !paging.records)\">\r" +
    "\n" +
    "            <div class=\"norecords ng-hide\" ng-show=\"!loading && options.norecords && !data.length\">{{::options.norecords}}</div>\r" +
    "\n" +
    "            <div class=\"progress-infinite ng-hide\" ng-show=\"options.paging.infinite && loading\">\r" +
    "\n" +
    "                <md-progress-circular md-diameter=\"40\" md-mode=\"indeterminate\"></md-progress-circular>\r" +
    "\n" +
    "            </div>\r" +
    "\n" +
    "        </div>\r" +
    "\n" +
    "    </div>\r" +
    "\n" +
    "    <div class=\"paging\" ng-if=\"options.paging.enabled && !options.paging.infinite\" layout=\"row\">\r" +
    "\n" +
    "        <div class=\"records\"></div>\r" +
    "\n" +
    "        <div flex>\r" +
    "\n" +
    "            <ul class=\"pages\" ng-if=\"paging.pages>1 && options.paging.pages\">\r" +
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
    "                <md-select ng-model=\"options.paging.limit\" md-on-close=\"reload()\">\r" +
    "\n" +
    "                    <md-option ng-repeat=\"limit in options.paging.limits\" value=\"{{limit}}\">\r" +
    "\n" +
    "                        {{::limit}} records\r" +
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
