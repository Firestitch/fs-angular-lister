'use strict';


angular.module('app')
  .controller('ListerrCtrl', function ($scope, DummyService) {

    $scope.click = click;
    $scope.listerInstance = {};

    function click() {
        var s = $scope;

        $scope.listerInstance.load();
    }

    $scope.listerConf = {

        rowClick: function(data) {
           // alert("Row Click: " + JSON.stringify(data));
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
            }},
            { title: 'Select', 

                resolve: { neighborhoods2:  [ { asdasd: "asdasd"}, { as34: "234234" }] },
                value: function () {

                //var neighborhoods2  = [ { asdasd: "asdasd"}, { as34: "234234" }];
                

                //  angular.module('lister',[])
                //.directive('lister', function ($compile, $sce, $filter) {

                return '<md-input-container><md-select ng-model="someModel" placeholder="Select a state"><md-option ng-value="opt" ng-repeat="opt in neighborhoods2">{{ opt }}</md-option></md-select></md-input-container>';



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
