'use strict';

function IndexCtrl($scope, filterFilter, $http, $location, $filter, $routeParams) {
	$scope.alerts = [];
	$scope.devAlerts = [];
  $scope.params = $routeParams;
  $scope.projectSet = $scope.params.projectSet;
  $scope.setInfo = {};
  $scope.setInfo.projectSets = [
    {name: "csc", hasAgenda: true, parentIds: []},
    {name: "sandy", hasAgenda: false, parentIds: []}
  ];
  $scope.$watch('projectSet', function(oldVal, newVal) {
    var setIdx = findIndexByKeyValue($scope.setInfo.projectSets, 'name', $scope.projectSet);
    if (setIdx < 0) {
      $scope.setInfo.currentSet = {};
    }
    else {
      $scope.setInfo.currentSet = $scope.setInfo.projectSets[setIdx];
    }
  }, true);


	$scope.setRoute = function(route) {
   	$location.path(route);
  };

	$scope.links = [
    {route: "view", text: "<i class='icon-search'></i> View Projects"},
    {route: "edit", text: "<i class='icon-pencil'></i> Edit Projects"},
    {route: "edit", text: "<i class='icon-plus'></i> Create Project"},
    {route: "agendas", text: "<i class='icon-leaf'></i> Edit Agendas"},
    {route: "docs", text: "<i class='icon-book'></i> Documentation"}
  ];

  $scope.setLinks = function() {
    var setLinks = $scope.links
    if (!$scope.setInfo.currentSet.hasAgenda) {
      var idx = findIndexByKeyValue($scope.links, 'route', 'agendas')
      if (idx > 0) {
        setLinks.splice(idx, 1);
      }
    }
    return setLinks;
  };

}
