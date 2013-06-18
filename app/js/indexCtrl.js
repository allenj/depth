'use strict';

function IndexCtrl($scope, filterFilter, $http, $location, $filter, Item, ItemsResult, $cookies) {
	$scope.alerts = [];
	$scope.devAlerts = [];

	$scope.setRoute = function(route) {
   	$location.path(route);
  };

	$scope.links = [
    {route: "index", text: "<i class='icon-home'></i> Home"},
    {route: "view", text: "<i class='icon-search'></i> View Projects"},
    {route: "edit", text: "<i class='icon-pencil'></i> Edit Projects"},
    {route: "edit", text: "<i class='icon-plus'></i> Create Project"},
    {route: "agendas", text: "<i class='icon-leaf'></i> Edit Agendas"},
    {route: "docs", text: "<i class='icon-book'></i> Documentation"}
  ];
}
