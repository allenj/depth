
function ViewProjectCtrl($scope, $routeParams, $cookies, State, Item, $filter, AppConfig) {
  $scope.AppConfig = AppConfig;
  $scope.item = {};

  // Get an item from ScienceBase by id
  var getItem = function(id) {
    var item = Item.get({
      itemId: id,
      josso: $cookies["JOSSO_SESSIONID"]
    }, function() {
      $scope.item = item;
    });
    return item;
  };

  if (!$routeParams.itemId) {
    return "Failed to load project, no itemId found"
  } 
  else {
    getItem($routeParams.itemId);
  }

  $scope.hasAgendas = function() {
    var hasAgenda = false
    if ($scope.item && $scope.item.facets) {
      angular.forEach($scope.item.facets, function(facet) {
        if (facet.className == "gov.sciencebase.catalog.item.facet.ExpandoFacet") {
          if (facet.object && facet.object.agendas && facet.object.agendas.length > 0) {
            hasAgenda = true;
          }
        }
      })
    }
    return hasAgenda;
  };


}