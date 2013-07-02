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
  // Load config file
  $http.get('depthConfig.json').success(function(data){
    $scope.projectSets = data.projectSets;
    resetCurrentSet();
  });

  var refreshLinks = function() {
    $scope.shared.curLinks = angular.copy($scope.links);
    // Had to use some jQuery to see if the object is empty
    if ($.isEmptyObject($scope.shared.currentSet)) {
      $scope.shared.curLinks = [];
    } 
    if (!$scope.shared.currentSet.hasAgenda) {
      var idx = findIndexByKeyValue($scope.shared.curLinks, 'shortName', 'agendas')
      if (idx > 0) {
        $scope.shared.curLinks.splice(idx, 1);
      }
    }
  };
  refreshLinks();

  var resetCurrentSet = function() {
    var setIdx = findIndexByKeyValue($scope.projectSets, 'shortName', $scope.routeParams.projectSet);
    if (setIdx < 0) {
      $scope.shared.currentSet = {};
      $location.path('/');
    }
    else {
      $scope.shared.currentSet = $scope.projectSets[setIdx];
      refreshLinks();
    }
  };

  // Watches
  $scope.$watch('projectSets', function(oldVal, newVal) {
    var setIdx = findIndexByKeyValue($scope.projectSets, 'shortName', $scope.projectSet);
    if (setIdx < 0) {
      $scope.shared.currentSet = {};
    }
    else {
      $scope.shared.currentSet = $scope.projectSets[setIdx];
      refreshLinks();
    }
  }, true);

  // Functions
	$scope.setRoute = function(route) {
    if ($scope.shared.currentSet.shortName && route !== "/") {
      route = route + "/" + $scope.shared.currentSet.shortName;
    }
   	$location.path(route);
  };

}

