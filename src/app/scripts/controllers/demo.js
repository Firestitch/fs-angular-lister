'use strict';


angular.module('app')
  .controller('DemoCtrl', function ($scope, DummyService, fsModal, $timeout, $mdDialog, $q, $filter) {

    $scope.modal = modal;
    $scope.listerInstance = {};

    $scope.load = function() {
        $scope.listerInstance.load();
    }

    $scope.data = function() {
        alert(JSON.stringify($scope.listerInstance.data()));
    }

    $scope.reload = function() {
        $scope.listerInstance.reload();
    }

    function modal() {
        fsModal.show('DemoCtrl',
                    'views/listermodal.html'
                    );
    }

    $scope.newFilters = function() {
        
        var filter = $filter('filter')($scope.listerConf.filters,{ name: 'range' })[0];
        if(filter) {
            filter.disabled = true;
        }
    }

    $scope.listerConf = {

        debug: false,

        persist: {
            name: 'lister',
            timeout: 60
        },

        //inline: true,
        sort: {
            stop: function(item,list,$indexFrom,$indexTo) {
                debugger;
            }
        },

        rowClick: function(data) {
           // alert("Row Click: " + JSON.stringify(data));
        },

        data: function(query, cb) {

            //return setTimeout(function() { cb([]); }, 2000);

            query.count = 50;

            return DummyService.gets(query,{ url: 'https://service.firestitch.com/api/', key: 'objects', datapaging: true });

            DummyService
                .gets(query,{ url: 'https://spec.local.firestitch.com/api/' })
                .then(function(result) {
                    cb(result.objects,result.paging);
                })
                .catch(function (response) {
                    console.log(response);
                });
        },

        load: true,


        paging: {

            //infinite: true,
            //pages: false,
            limit: 5
        },

        //paging: false,
        /*
        action:
        {
            click: function(data, event) {

                if(this.delete) {

                }
            },
            delete: {
                title: 'Attention',
                content: 'Please confirm',
                ok: function(data) {
                    alert('OK!');
                }

            }
        },
        */

        topActions: [
            {
                label: 'Export',
                click: function(data,event) {
                    debugger;
                    alert('Export');
                }
            },
            {
                label: 'Add Something',
                click: function() {
                    alert('Add Something');
                }
            },
            {
                label: 'Menu 1',
                more: true,
                icon: 'delete',
                click: function() {
                    alert('Menu 1');
                }
            },
            {
                label: 'Menu 2',
                more: true,
                icon: 'delete',
                click: function() {
                    alert('Menu 2');
                }
            }
        ],

        actions: [

            {
                label: 'Edit',
                icon: 'edit',
                click: function(data, event, helper) {
                    helper.reload();
                    //alert("Edit Action Click: " + JSON.stringify(data));
                }
            },

            {
                label: 'Delete',
                show: function() { return true },
                delete:  {
                            content: 'Are you sure you would like to remove this?',
                            ok: function(data) {
                                alert("Delete Action Click: " + JSON.stringify(data));

                                var deferred = $q.defer();
                                deferred.resolve();
                                return deferred.promise;
                            }
                        }
            }

        ],

        columns: [
            {   title: 'Name' ,
                order: { name: 'name', default: true },
                value: function(data) {
                    return "<b>" + data['name'] + "</b>";
                },
                width: '20%'
            },
            {   title: 'GUID' ,
                center: true,
                order: 'guid',
                value: function(data) {
                    return '<a href ng-click="test(data)">{{data.guid}}</a>';
                },
                scope: {
                    test :function(data, event, x,c,v) {
                        debugger;
                    }
                }
            },
            {   title: 'Date',
                className: 'center',
                order: { name: 'date' },
                value: function(data, $scope, myresolve) {
                    return data["date"];
                }
            },
            {   title: 'Select',
                value: function (label, $scope, data, list) {
                    return '<md-input-container><md-select ng-model="someModel" placeholder="{{label}}" ng-change="click()"><md-option ng-value="opt" ng-repeat="opt in list">{{ opt.label }}</md-option></md-select></md-input-container>';
                },
                resolve: {
                    label: function() {
                        return "Select a state!";
                    },
                    list: function() { return [ { label: "Item 1"}, { label: "Item 2" }] }
                },
                scope: {
                    click: function() {
                        alert("You Clicked me!");
                    }
                }
            }
        ],

        selection: {
            actions: [{
                icon: 'delete',
                label: 'Delete',
                click: function(selected, $event, helper) {
                    //alert("delete");
                }
            },
            {
                icon: 'forward',
                label: 'Move to Somewhere',
                click: function(selected, $event) {
                    fsModal
                    .show(  function($scope, modal) {
                                $scope.move = function() {
                                    fsModal.hide();
                                }

                                $scope.cancel = function() {
                                    fsModal.hide();
                                }
                            },
                            'views/modal.html',
                            { resolve : {
                                modal: function() {
                                    return $scope.modal;
                                }
                            }})
                    .then(function() {
                        $scope.modal();
                    });
                }
            }]
        },

        filters: [
            {
                name: 'search',
                type: 'text',
                label: 'Search',
                param: 'search'
            },
            {
                name: 'state',
                type: 'select',
                label: 'State',
                values: {
                    __all: 'All',
                    active: 'Active',
                    pending: 'Pending',
                    completed: 'Completed',
                    deleted: 'Deleted'
                },
                multiple: true
            },

            {
                name: 'isolate',
                type: 'select',
                label: 'Isolate',
                values: {
                    __all: 'All',
                    active: 'Active',
                    pending: 'Pending',
                    completed: 'Completed',
                    deleted: 'Deleted'
                },
                isolate: { label: 'Show Deleted', value: 'deleted' }
            },

            {
                name: 'isolatemultiple',
                type: 'select',
                label: 'Isolate Multiple',
                values: {
                    active: 'Active',
                    pending: 'Pending',
                    completed: 'Completed',
                    deleted: 'Deleted'
                },
                isolate: { label: 'Show Deleted', value: 'deleted' },
                multiple: true
            },                        
            {
                name: 'multiple',
                type: 'select',
                label: 'Multiple',
                values: function(){ return {
                    pear: 'Pear',
                    orange: 'Orange',
                    banana: 'Banana',
                    apple: 'Apple',
                }; },
                multiple: true,
                default: {
                    pear: 'Pear',
                    orange: 'Orange',
                    banana: 'Banana',
                    apple: 'Apple',
                },
            },
            {
                name: 'multiple_objs',
                type: 'select',
                label: 'Multiple Objs',
                values: function(){
                    return [
                    	{value: 'red', name: 'Red'},
                    	{value: 'green', name: 'Green'},
                    	{value: 'blue', name: 'Blue'},
                    	{value: 'yellow', name: 'Yellow'},
                	];
            	},
                multiple: true,
                default: {
                    pear: 'Pear',
                    orange: 'Orange',
                    banana: 'Banana',
                    apple: 'Apple',
                },
            },

            {
                name: 'nested_values',
                type: 'select',
                label: 'Nested - Values',
                nested: {children_field: 'children'},
                values: { //objects with nested child objects
                    a: 'A',
                    b: {	name:'B',
                    		children:{
                    			b1: 'B1',
                    			b2: {	name:'B2',
                    					children: {
                    						b2_1: 'B2-1',
                    						b2_2: 'B2-2',
                    					}
                    				},
                    		}
                    	},
                    c: 'C',
                }
            },
            {
                name: 'nested_gen',
                type: 'select',
                label: 'Nested - Gen',
                nested: {
                    objects: [	//flat array of objects with parent_id->id values.
                    	{id: 1, parent_id:null, name: 'ball'},
                    	{id: 2, parent_id:1, name: 'soccer'},
                    	{id: 3, parent_id:1, name: 'pool'},
                    	{id: 4, parent_id:3, name: 'billards'},
                    	{id: 5, parent_id:3, name: 'snooker'},
                    	{id: 6, parent_id:null, name: 'stick'},
                    	{id: 7, parent_id:6, name: 'javelin'},
                    ],
                    parent_field: 'parent_id',
                    label_field: 'name',
                    value_field: 'id'
                },
                multiple: true
            },

            {
                name: 'date',
                type: 'date',
                label: 'Date',
                time: false
            },
            {
                name: 'datetime',
                type: 'date',
                label: 'Date with Time'
            },
            {
                name: 'range',
                type: 'range',
                label: 'Numbered range',
                placeholders: ['Min', 'Max']
            },
            {
                name: 'toggle',
                type: 'checkbox',
                label: 'Checkbox',
                checked: 'active',
                unchecked: 'delete'
            }
        ]
    };
});
