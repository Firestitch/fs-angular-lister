(function () {
    'use strict';
    

    /**
     * @ngdoc service
     * @name app.trade_categoryService
     * @description
     * # trade_categoryService
     * Factory in the app.
     */
    angular.module('app')
    .factory('DummyService', function (apiService) {
       
        var categoryObject = {
                isNew: true,
                name: '',
                color: ''
            };

        var service = {
            instantiate:instantiate,
            setId:setId,
            gets:gets,
            get:get,
            put:put,
            post:post,
            'delete':deleted
        };
       
        return service;

        function instantiate() {
            return categoryObject;
        }

        function setId(id) {
            if(id) {
                categoryObject.id = id;
                categoryObject.isNew = false;
            } 
            else {
                categoryObject.id = 0;
                categoryObject.isNew = true;
            }
        }
        
        function gets(data,options) {
            return apiService.get('dummy', data, apiService.options(options));
        }

        function get(trade_category_id) {
            return apiService.get('tradecategories/' + trade_category_id + '', {}, {key: 'trade_category'});
        }

        function put(data) {
            return apiService.put('tradecategories/' + data.id + '', data, {key: 'trade_category'});
        }

        function post(data) {
            return apiService.post('tradecategories', data, { key: 'trade_category' });
        }

        function deleted(trade_category_id) {
            return apiService.delete('tradecategories/' + trade_category_id + '');
        }


    });
})();