'use strict';


angular.module('app')
  .controller('DemoCtrl', function ($scope, DummyService, fsModal, $timeout, $mdDialog, $q, $filter, fsLister, fsArray) {

    $scope.modal = modal;

	$scope.selectionGets = function() {
        alert($scope.listerConf.instance.selection.gets());
    }

    $scope.load = function() {
        $scope.listerConf.instance.load();
    }

    $scope.$on("test",function() {

    });

    $scope.data = function() {
        alert(JSON.stringify($scope.listerConf.instance.data.gets()));
    }

    $scope.reload = function() {
       $scope.listerConf.instance.reload();
       console.log($scope.listerConf.instance.filter.value.gets());
    }

    $scope.clearData = function() {
       $scope.listerConf.instance.data.clear();
    }

    $scope.clearFilters = function() {
       $scope.listerConf.instance.filter.clear();
    }

    $scope.clear = function() {
       $scope.listerConf.instance.clear();
    }

    $scope.setFilter = function() {
       	$scope.listerConf.instance.filter.value.set('state','pending',{ reload: false});
		$scope.listerConf.instance.search.update();
    }

    $scope.toggleAction = function() {
    	$scope.listerConf.topActions[0].show = !$scope.listerConf.topActions[0].show;
    }

    function modal() {
        fsModal.show('DemoCtrl',
                    'views/listermodal.html'
                    );
    }

    $scope.broadcastReload = function() {
    	fsLister.reload('demo');
    }

    $scope.getInstance = function() {
    	$scope.getInstanceObject = fsLister.get('demo');
    }

    $scope.newFilters = function() {

        var filter = $filter('filter')($scope.listerConf.filters,{ name: 'range' })[0];
        if(filter) {
            filter.disabled = true;
        }
    }

    var x = fsLister.create({
    			filters: [
                    {
                        name: 'keyword',
                        type: 'text',
                        label: 'Search'
                    },
                    {
                        name: { from: 'create_date_from', to: 'create_date_to' },
                        type: 'daterange',
                        label: 'Invoice Date'
                    },
                    {
                        name: { from: 'create_date_from1', to: 'create_date_to2' },
                        type: 'daterange',
                        label: 'Invoice Date'
                    },
                    {
                        name: { from: 'payment_due_date_from', to: 'payment_due_date_to' },
                        type: 'daterange',
                        label: 'Invoice Due Date'
                    }
                ]
            })
    .apply({
    		filters: [
                {
                    name: 'keyword',
                    label: 'Search!!!!!!!!!!!!!!'
                }
            ]
        })
    .options();

    $scope.listerConf = {
    	id: 'demo',
        debug: false,
        //title: 'Lister Title',
        /*savedFilter: {
    		filters: [
	    		{
	    			name: 'My Filter',
	    			guid: 'asd09743asd',
	    			values: {
	    				search: 'xxxx'
	    			},
	    			active: true
	    		}
	    	]
        },*/
        //container: '#frame',

        paging: {
        	limit: 10,
        	infinite: false,
        	all: true
        },
        //paging: false,

        persist: 'lister-test',

        order: { name: 'date', direction: 'desc' },
        //order: 'date',

        //inline: true,
        // sort: {
        //     stop: function(item,list,$indexFrom,$indexTo) {
        //         //debugger;
        //     }
        // },

        rowClick: function(data) {
           // alert("Row Click: " + JSON.stringify(data));
        },

        rowClass: function(data) {
           return 'guid-' + data.guid;
        },

        data: function(query, cb) {

            //return setTimeout(function() { cb([]); }, 2000);

            query.count = 22;
            //query.sleep = 2;

            return $q(function(resolve) {

	            setTimeout(function() {
		            var url = 'https://boilerplate.firestitch.com/api/';

		            //url = 'http://spec.local.firestitch.com/api/uuuu';

		            var locals = { total: 100, subtotal: 830 };

		/*            return DummyService.gets(query,{ url: url, key: 'objects', datapaging: true })
		                    .then(function(response) {
		                    	//return { data: {} };
		                        return { data: response.data, paging: response.paging, locals: locals };
		                    });
		*/
		            DummyService
		                .gets(query,{ url: url })
		                .then(function(result) {

		                	result.objects = [{ name: 'Group Bob1', data: [{ name: 'Bob1' }]},
		                		{ name: 'Group Bob2', data: [{ name: 'Bob2' },{ name: 'Bob2' },{ name: 'Bob2' },{ name: 'Bob2' },{ name: 'Bob2' }]}];

		                    resolve({ data: result.objects, paging: result.paging });
		                    //cb(result.objects,result.paging,locals);
		                })

		                /*.catch(function (response) {
		                        debugger;
		                    console.log(response);
		                });*/
		        },0);
		    });
        },

        group: {
        	columns: [ { template: '{{data.name}}', span: 2, styles: { background: 'pink' } }, { template: 'Something' }],
        	children: 'data'
        },

        load: true,


        /*paging: {

            infinite: true,
            //pages: false,
            limit: 5
        },*/

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
                icon: 'settings',
                click: function(data,event) {
                	//...
                },
                show: function() {
                	return false;
                	//return aclService.read(ACL.PERMISSION_PROJECT_EXPORT);
                }
            },
            {
                label: 'Add Project',
                click: function() {
                   //...
                },
                show: function() {
                	return false;
                	//return aclService.(ACL.PERMISSION_PROJECT);
                }
            },
            {
                type: 'template',
                template: '<md-button ng-click="click()">Upload</md-button>',
                show: false,
                scope: {
                	click: function() {
                		alert('asdasdasd');
                	}
                }
            },
/*            {
                label: 'Settings',
                icon: 'settings',
                click: function(data,event) {
                	alert('settings click');
                },
                type: 'icon'
            },*/

           /* {
            	type: 'menu',
            	icon: 'settings',
	            items: [
		            {
		                label: 'Menu 1',
		                icon: 'delete',
		                click: function() {
		                    alert('Menu 1');
		                }
		            },
		            {
		                label: 'Menu 2',
		                icon: 'delete',
		                show: function() {
		                	return 1;
		                },
		                click: function() {
		                    alert('Menu 2');
		                }
		            }
		        ]
	        }*/
        ],

        actions: [

            {
                label: 'Edit',
                icon: 'edit',
                show: function(data) {
                	return 0;
                },
                click: function(data, event, helper) {
                    helper.reload();
                    //alert("Edit Action Click: " + JSON.stringify(data));
                }
            },

            {
                label: 'Delete',
                show: function(data) {
                	return 1;
                },
                delete:  {
                            content: 'Are you sure you would like to remove this?',
                            ok: function(data) {
                                //alert("Delete Action Click: " + JSON.stringify(data));

                                var deferred = $q.defer();
                                deferred.resolve();
                                return deferred.promise;
                            }
                        }
            }

        ],
        headers: [
           	[
           		{
           			title: '2 colspan left',
           			span: 2,
           			styles: { background: 'red', color: 'white' }
           		},
           		{
           			title: '1 colspan right',
           			span: 1,
           			right: true,
           			styles: { background: 'blue', color: 'white' }
           		}
           	]
        ],
        columns: [
            {   title: 'Name' ,
                //order: { name: 'name', default: true, label: 'Name!!' },
                value: "{{data.name}}",
                width: '100px',
                header: {
                	styles: { background: 'red', color: 'white' },
                }
            },
            {   title: 'GUID' ,
                header: {
                	styles: { background: 'red', color: 'white' },
                },
               // order: 'guid',
                className: 'hide-xs',
                value: function(data) {
                    return '<a href ng-click="test(data)">{{data.guid}}</a>';
                },
                scope: {
                    test :function(data, event, x,c,v) {
                        debugger;
                    }
                },
                footer: {
                	right: true,
                	value: function() {
                		return '<a href ng-click="click()">Footer</a>';
                	},
                	scope: {
	                	click: function() {
	                        alert("You Clicked me!");
	                    }
	                }
                }
            },
            {   title: 'Date',
                center: true,
                //order: { name: 'date' },
                className: 'hide-xs',
                value: function(data, $scope, myresolve) {
                    return data["date"];
                },
                styles: { background: 'blue', color: 'white' },
                footer: {
                	center: true,
                	value: "{{total}}"
                }
            },
          /*  {   title: 'Select',
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
            }*/
        ],

        orders: [
            {   label: 'Something', name: 'date' },
            {   label: 'Something Else', name: 'custom_order' }
        ],

        selection: {
        	all: true,
        	show: true,
            actions: [{
                icon: 'delete',
                label: 'Delete',
                click: function(selected, $event, helper) {
                	debugger;
                    //alert("delete");
                },
                show: function() {
                	return true;
                }
            },
            {
                icon: 'forward',
                label: 'Move to Somewhere',
                show: true,
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
                name: 'autocompletechips',
                type: 'autocompletechips',
                label: 'Autocomplete Chips',
                values: function(text,filter) {
                	return $q(function(resolve) {
                		resolve([	{ name: 'ssss', value: 'SSSSS' },
                					{ name: 'ddddd', value: 'DDDDD' }]);
                	});
                }
            },
           {
                name: 'date',
                type: 'date',
                label: 'Date',
                time: false,
                default: null,
                query: 'date'
            },

         {
                name: 'isolate',
                type: 'select',
                label: 'Isolate',
                multiple: true,
                values: function() {
                    return $q(function(resolve) {
                           resolve({
                                active: 'Active',
                                pending: 'Pending',
                                completed: 'Completed',
                                deleted: 'Deleted'
                            });
                    });
                },
                isolate: { label: 'Show Deleted', value: 'deleted' }
            },

            {
                name: 'autocomplete',
                type: 'autocomplete',
                label: 'Autocomplete',
                values: function(text) {
                	return $q(function(resolve) {
                		resolve([	{ name: 'ssss', value: 'SSSSS' },
                					{ name: 'ddddd', value: 'DDDDD' }]);
                	});
                }
            },
           {
                name: 'toggle',
                type: 'checkbox',
                label: 'Checkbox',
                default: 'checked',
                checked: 'checked',
                unchecked: 'unchecked'
            },
           {
                name: 'state',
                type: 'select',
                label: 'State',
                multiple: true,
                change: function(instance) {
                	console.log('state filter changed', this, instance);
                },
                //default: 'active',
               	values: function() {
                    var values = [{ value: 'active', name: 'Active' },
                                    { value: 'pending', name: 'Pending' },
                                    { value: 'deleted', name: 'Deleted' } ];

                    return new Promise(function(resolve, reject) {

                        setTimeout(() => {
                            resolve(values);
                        });
                    });
                }
/*                values: fsArray.nameValue({
                    __all: 'All',
                    active: 'Active',
                    pending: 'Pending',
                    completed: 'Completed',
                    deleted: 'Deleted'
                })*/
            },
            {
                name: { from: 'daterange_from', to: 'daterange_to' },
                type: 'daterange',
                label: 'Date Range'
            },
            {
                name: { from: 'daterange_from2', to: 'daterange_to2' },
                type: 'daterange',
                label: 'Date Range'
            },            
           /*{
                name: 'date',
                type: 'date',
                label: 'Date',
                default: new Date()
            },
            {
                name: 'datetime',
                type: 'datetime',
                label: 'Date/Time'
            },
            {
                name: 'daterange',
                type: 'daterange',
                label: 'Date Range'
            },
            {
                name: 'datetimerange',
                type: 'datetimerange',
                label: 'Date Time Range'
            },*/
           {
                name: 'search',
                type: 'text',
                label: 'Search',
                param: 'search'
            },
            /*
            {
                name: 'state',
                type: 'select',
                label: 'State',
                change: function(instance) {
                	console.log('state filter changed', this, instance);
                },
                values: {
                    __all: 'All',
                    active: 'Active',
                    pending: 'Pending',
                    completed: 'Completed',
                    deleted: 'Deleted'
                }
            },*/
/*
            {
                name: 'state',
                type: 'select',
                label: 'State [key,name]',
                values: [
                    { value: undefined, name: 'All (Null Value)' },
                    { value: 'active', name: 'Active' },
                    { value: 'pending', name: 'Pending' },
                    { value: 'completed', name: 'Completed' },
                    { value: 'deleted', name: 'Deleted' }
                ]
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
                name: 'multiple_key_value',
                type: 'select',
                label: 'Multiple (Key/Value)',
                values: function(){
                	return {
	                    pear: 'Pear',
	                    orange: 'Orange',
	                    banana: 'Banana',
	                    apple: 'Apple',
	                };
	            },
                multiple: true,
                default: [
                    'pear',
                    'orange',
                    'banana',
                    'apple'
                ],
            },

            {
                name: 'nested',
                type: 'select',
                label: 'Nested',
                values: [  //flat array of objects with parent_id->id values.
                        {id: 1, parent_id:null, name: 'ball'},
                        {id: 2, parent_id:1, name: 'soccer'},
                        {id: 3, parent_id:1, name: 'pool'},
                        {id: 4, parent_id:3, name: 'billards'},
                        {id: 5, parent_id:3, name: 'snooker'},
                        {id: 6, parent_id:null, name: 'stick'},
                        {id: 7, parent_id:6, name: 'javelin'}
                ],
                nested: {
                    parent_field: 'parent_id',
                    label_field: 'name',
                    value_field: 'id'
                },
                multiple: true
            },
            {
                name: 'multiple',
                type: 'select',
                label: 'Multiple With Grouping',
                values: function() {
                    return  [   {    value: 'pear', name: 'Pear', group: 'Group B' },
                                {    value: 'orange', name: 'Orange', group: 'Group B' },
                                {    value: 'banana', name: 'Banana', group: 'Group A' },
                                {    value: 'apple', name: 'Apple', group: 'Group A' }];
                },
                multiple: true
            },

            {
                name: 'range',
                type: 'range',
                label: 'Numbered range',
                placeholders: ['Min', 'Max']
            },

            {
                name: 'multiple_objects',
                type: 'select',
                label: 'Multiple (Object)',
                values: function(){
                    return [
                    	{value: 'red', name: 'Red'},
                    	{value: 'green', name: 'Green'},
                    	{value: 'blue', name: 'Blue'},
                    	{value: 'yellow', name: 'Yellow'},
                	];
            	},
                multiple: true,
            },
                {
                    name: 'modify_date',
                    type: 'select',
                    label: 'Last Modified',
                    values: function() {
                        return [{ name: 'Any', value: 0 },
                                { name: 'Past hour', value: 1 },
                                { name: 'Past 24 hours', value: 24 },
                                { name: 'Past week', value: 168 },
                                { name: 'Past month', value: 173 },
                                { name: 'Past year', value: 8760 }];
                    }
                }*/

            ,{
                //name: { min: 'range_min', max: 'range_max' },
                name: 'range',
                type: 'range',
                label: 'Numbered range',
                placeholders: ['Min', 'Max']
            },
        ]
    };
});
