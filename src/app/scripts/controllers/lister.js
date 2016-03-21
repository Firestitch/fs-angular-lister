'use strict';


angular.module('app')
  .controller('ListerCtrl', function ($scope, DummyService, fsModal, $timeout, $mdDialog, $q) {

    $scope.click = click;
    $scope.modal = modal;
    $scope.listerInstance = {};

    function click() {
        $scope.listerInstance.load();
    }

    function modal() {
        fsModal.show('ListerCtrl',
                    'views/listermodal.html'
                    );     
    }

    $scope.listerConf = {

        debug: true,

        rowClick: function(data) {
           // alert("Row Click: " + JSON.stringify(data));
        },
        data: function(query, cb) {
            
            query.count = 300;

            return DummyService.gets(query,{ url: 'http://service.firestitch.com/api/', key: 'objects', datapaging: true });

            
            DummyService
                .gets(query,{ url: 'http://spec.local.firestitch.com/api/' })
                .then(function(result) {
                    cb(result.objects,result.paging);
                })
                .catch(function (response) {
                    console.log(response);
                });
        },

        load: true,

        paging: {
            infinite: true,
            limit: 20
        },
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
                primary: false,
                click: function() {
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
            { title: 'Name' , value: function(data) {
                return "<b>" + data['name'] + "</b>";
            }},
            { title: 'GUID' , className: 'center', value: function(data) {
                return '<a href="#/test">' + data["guid"] + '</a>';
            }},
            {   title: 'Date',
                className: 'center',
                value: function(data, $scope, myresolve) {
                    return data["date"];
                },
                resolve: {
                    myresolve: function() {
                        return "myresolve!!";
                    }
                }
            },
            {   title: 'Select', 
                value: function (label, $scope, data, list) {
                    return '{{prefix}}<md-input-container><md-select ng-model="someModel" placeholder="{{label}}"><md-option ng-value="opt" ng-repeat="opt in list">{{ opt.label }}</md-option></md-select></md-input-container>';
                },
                resolve: {
                    label: function() {
                        return "Select a state!";
                    },
                    list: function() { return [ { label: "Item 1"}, { label: "Item 2" }] }
                },
                scope: {
                    prefix: 'Make a section '
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
                label: 'Search'
            },
            {
                name: 'state',
                type: 'select',
                label: 'State',
                values: {
                    __all: 'All',
                    active: 'Active',
                    deleted: 'Deleted'
                }
            },
            {
                type: 'newline'
            },
            {
                name: 'date',
                type: 'date',
                label: 'Date'
            },
            {
                name: 'range',
                type: 'range',
                label: 'Numbered range',
                placeholders: ['Min', 'Max']
            }
        ]
    };
});
