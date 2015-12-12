'use strict';


angular.module('app')
  .controller('ListerrCtrl', function ($scope, DummyService) {

    $scope.click = click;
    $scope.listerInstance = {};

    function click() {
        var s = $scope;

        $scope.listerInstance.load();
        debugger;
    }

    $scope.listerConf = {

        rowClick: function(data) {
            alert("Row Click: " + JSON.stringify(data));
        },
        data: function(query, cb) {
            
            query.count = 30;

            DummyService
                .gets(query,{ url: 'http://scenario.local.firestitch.com/api/' })
                .then(function(result) {
                    cb(result.objects,result.paging);
                })
                .catch(function (response) {
                    console.log(response);
                });
        },
        actions: [
            {
                click: function(data, event) {
                    alert("Edit Action Click: " + JSON.stringify(data));
                }
            },
             /*
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
                click: function(data, dataRefresh) {
                    alert("Delete Action Click: " + JSON.stringify(data));
                }
            }
            */
        ],
        columns: [
            { title: 'Name' , value: function(data) {
                return "<b>" + data['name'] + "</b>";
            }},
            { title: 'GUID' , className: 'center', value: function(data) {
                return data["guid"];
            }},
            { title: 'Date', className: 'center', value: function(data) {
                return data["date"];
            }}
        ],
        filters: [
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
                name: 'startdate',
                type: 'date',
                label: 'Start Date'
            },
            {
                name: 'enddate',
                type: 'date',
                label: 'End Date'
            }
        ]
    };
});
