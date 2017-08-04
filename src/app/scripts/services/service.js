(function () {

    angular.module('fs-angular-lister')
	.provider("fsLister",function() {

		var _options = {}, _instances = {};
		this.options = function(options) {
			_options = options;
		}

		this.$get = function($rootScope, fsArray, fsUtil) {

			var service = {
				options: options,
				reload: reload,
				add: add,
				get: get,
				extend: extend,
				create: create,
				filter: filter
			 };

			return service;

			function options() {
				return _options;
			}

			function reload(name) {
				$rootScope.$broadcast('lister-' + name,{ action: 'reload' });
			}

			function add(id, instance) {
				return _instances[id] = instance;
			}

			function get(id) {
				return _instances[id];
			}

			function filter(id, filters) {
				return get(id).data.gets(filters);
			}

			function extend(name, object, filters) {
				$rootScope.$broadcast('lister-' + name,{ action: 'extend', object: object, filters: filters });
			}

			function create(options) {
				return new fsListerOption(options);
			}

			function fsListerOption(options) {

				var options = options;
				var self = this;
				this.options = function() {
					return options;
				}

				this.extend = function(optionName, name, value) {

					if(!options[optionName]) {
						options[optionName] = [];
					}

					var option = fsArray.filter(options[optionName],{ name: name })[0];
					if(option) {
						angular.extend(option,value);
					} else {
						options[optionName].push(value);
					}

					return this;
				}

				this.filter = function(name, value) {
					extend('filters',name,value);
					return this;
				}

				this.apply = function(data) {
					angular.forEach(data,function(value,name) {
						if(fsUtil.isArray(value)) {
							angular.forEach(value,function(item) {
								self.extend(name,item.name,item);
							});
						} else {
							var option = {};
							option[name] = value;
							angular.extend(options,option);
						}

					});
					return this;
				}
			}
		}
	});
})();

