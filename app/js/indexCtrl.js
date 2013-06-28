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
  $scope.shared.curLinks = angular.copy($scope.links);

  var refreshLinks = function() {
    $scope.shared.curLinks = angular.copy($scope.links);
    // Had to use some jQuery to see if the object is empty
    if ($.isEmptyObject($scope.shared.currentSet)) {
      $scope.shared.curLinks = [];
    } 
    if (!$scope.shared.currentSet.hasAgenda) {
      var idx = findIndexByKeyValue($scope.shared.curLinks, 'route', 'agendas')
      if (idx > 0) {
        $scope.shared.curLinks.splice(idx, 1);
      }
    }
  };
  refreshLinks();

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
  $scope.$watch('projectSets', function(oldVal, newVal) {
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

