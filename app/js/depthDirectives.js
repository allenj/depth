Depth.directive('stuck', function ($timeout, $window) {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      var top = attrs.top;
      // var bottom = attrs.bottom;
      $window = angular.element($window);

      var handler = function() {
        // console.log("window scrolltop: " + $window.scrollTop());
        // console.log("position: " + JSON.stringify(element.position()));

        var distanceFromTop = element.position().top - $window.scrollTop();
        // var distanceFromBottom = element.position().bottom - $window.scrollTop();
        // console.log("distTop: " + distanceFromTop);
        // console.log("distBottom: " + distanceFromBottom);

        if (distanceFromTop < top) {
          element.children().css({top: top + 'px', position:'fixed'});
          // element.css({top: top + 'px', position: 'fixed', width: '100%'});
        } 
        else {
          element.children().css({top: 'auto', position: 'relative'});
          // element.css({top: 'auto', position: 'relative'});
        }
        // if (distanceFromBottom < bottom) {
          // console.log("bottom out");
        // }

      }
      $window.on('scroll', handler);

    }
  }
});

Depth.directive('radioButton', function() {
  return {
    restrict: 'E',
    scope: {model: '=', number: '=', theme: '=', width: '='},
    controller: function($scope, $element) {
      $scope.$watch('model', function(oldVal, newVal) {
        // Change "Boolean" values from model to Boolean false
        if ($scope.model === "Boolean") $scope.model = false;
      }, true);

      $scope.realWidth = $scope.width*30;

      $scope.activate = function() {
        if ($scope.model) {
          $scope.model = false; 
        }
        else { 
          $scope.model = true; 
        }
      }
    },
    template: "<button style='width: {{realWidth}}px;' type='button' class='btn btn-mini' " +
              "ng-class='{active: model}'" +
              "ng-click='activate()'>" +
              "{{number}}{{theme}}" +
              "</button>"
  }
});