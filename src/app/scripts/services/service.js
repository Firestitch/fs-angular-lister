(function () {

    angular.module('fs-angular-lister')
	.provider("fsLister",function() {

		var _options = {};
		this.options = function(options) {
			_options = options;
		}

		this.$get = function($rootScope) {

			var service = {
				options: options,
				reload: reload
			 };

			return service;

			function options() {
				return _options;
			}

			function reload(name) {
				$rootScope.$broadcast('lister-' + name,{ action: 'reload' });
			}
		}
	});
})();
