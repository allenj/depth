Depth.directive('stuck', function ($timeout, $window) {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      var top = attrs.top;
      // var bottom = attrs.bottom;
      $window = angular.element($window);

      var handler = function() {

        var distanceFromTop = element.position().top - $window.scrollTop();

        // By making a second element we can avoid the 'jump' that comes from moving divs
        // This will only work for elements that span the entire width of the browser
        var secondElement = angular.element('#error-bar');
        if (distanceFromTop < top) {
          // if (!secondElement || ! secondElement.attr('id') || secondElement.attr('id') !== 'error-bar') {
          //   secondElement = element.clone();
          //   secondElement.attr('id', 'error-bar');
          //   secondElement.addClass('hide');
          //   element.append(secondElement);
          // }
          // secondElement.children().css({top: top + 'px', position:'fixed'});
          secondElement.removeClass('hide');
        } 
        else {
          // if (secondElement) {
            secondElement.addClass('hide');
          // }
        }
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