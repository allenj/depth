'use strict';

function IndexCtrl($scope, filterFilter, $http, $location, $filter, $routeParams, State) {
	$scope.alerts = [];
	$scope.devAlerts = [];
  $scope.routeParams = $routeParams;
  $scope.projectSet = $routeParams.projectSet;
  $scope.setInfo = {};
  $scope.shared = State.shared;
  $scope.projectSets = $scope.shared.projectSets;
  $scope.currentSet = $scope.shared.currentSet;
  $scope.links = $scope.shared.links;
  $scope.currentSet = $scope.shared.currentSet;
  $scope.curLinks = angular.copy($scope.links);

  var refreshLinks = function() {
    $scope.curLinks = angular.copy($scope.links);
    if (!$scope.shared.currentSet.hasAgenda) {
      var idx = findIndexByKeyValue($scope.curLinks, 'route', 'agendas')
      if (idx > 0) {
        $scope.curLinks.splice(idx, 1);
      }
    }
  };

  var setIdx = findIndexByKeyValue($scope.shared.projectSets, 'route', $scope.routeParams.projectSet);
  if (setIdx < 0) {
    $scope.shared.currentSet = {};
    $location.path('/');
  }
  else {
    $scope.shared.currentSet = $scope.shared.projectSets[setIdx];
    refreshLinks();
  }

  // Watches
  $scope.$watch('projectSet', function(oldVal, newVal) {
    var setIdx = findIndexByKeyValue($scope.shared.projectSets, 'route', $scope.projectSet);
    if (setIdx < 0) {
      $scope.shared.currentSet = {};
    }
    else {
      $scope.shared.currentSet = $scope.shared.projectSets[setIdx];
      refreshLinks();
    }
  }, true);

  // Functions
	$scope.setRoute = function(route) {
    if ($scope.shared.currentSet.route && route !== "/") {
      // route = route + "/" + $scope.shared.currentSet.route;
      route = $scope.shared.currentSet.route + "/" + route;
    }
   	$location.path(route);
  };

}

