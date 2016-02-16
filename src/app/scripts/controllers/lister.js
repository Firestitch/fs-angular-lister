'use strict';


angular.module('app')
  .controller('ListerCtrl', function ($scope, DummyService, fsModal, $timeout, $mdDialog) {

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

        rowClick: function(data) {
           // alert("Row Click: " + JSON.stringify(data));
        },
        data: function(query, cb) {
            
            query.count = 50;

            DummyService
                .gets(query,{ url: 'http://scenario.local.firestitch.com/api/' })
                .then(function(result) {
                    cb(result.objects,result.paging);
                })
                .catch(function (response) {
                    console.log(response);
                });
        },

        paging: {
            //infinite: true,
            //limit: 10
        },

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
         /*

        actions: [
             
            {
                label: 'Edit',
                icon: 'edit',
                click: function(data, event) {
                    alert("Edit Action Click: " + JSON.stringify(data));
                }
            },
           
            {
                label: 'Delete',
                icon: 'delete',
                delete:  {  
                            content: 'Are you sure you would like to remove this?',
                            ok: function(data) {                            
                                alert("Delete Action Click: " + JSON.stringify(data));
                            }
                        }
            }
           
        ],

        */
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
                click: function(selected, $event) {
                    alert("delete");
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
