(function(angular) {
  var affixDirective = angular.module('directive.affix', []);

  var Templates = {
    affix:      
      '<ul class="nav nav-list bs-docs-sidenav">' +
        '<li ng-repeat="affix in affixes" id="{{affix.href}}"><a href="#/docs/#{{affix.href}}"><i class="icon-chevron-right"></i>{{affix.name}}</a></li>' +
      '</ul>'
  };

  affixDirective.directive('affix', ['$compile', function($compile) {
    return {
      restrict: 'E',
      replace: true, 
      transclude: true,
      template: Templates.affix,
      scope: {},
      compile: function(element, attrs, transclude) {
        var body = $('body');
        var affixes = [];       
        return {
          post: function(scope, element, attrs) {  
            scope.affixes = affixes;
            $('.affix-section', body).find('section').each(function() {
              var section = $(this);                            
              affixes.push({
                href : section.attr('id'),
                name : section.attr('name')
              });
              $compile(element)(scope);
            });
          }
        };
      }
    };
  }]);
  
  affixDirective.directive('affixScroll', ['$window', function ($window) {
    return {
      link: function (scope, element, attrs) {
        var offset;
        var buffer = 10;
        var top = element.offset().top - buffer;
        var bottom = top + element.height() - buffer;
                
        angular.element($window).on('scroll.affix-scroll', function () {
          
          var id = element.attr('id'); 
          if (angular.isDefined($window.pageYOffset)) {
            offset = $window.pageYOffset;
          } else {
            var iebody = (document.compatMode && document.compatMode !== "BackCompat") ? document.documentElement : document.body;
            offset = iebody.scrollTop;
          }
         
          var modal = $('li#'+id);          
          if (top < offset && offset < bottom) {
            if (!modal.hasClass('active')) {
              modal.addClass('active');
            }
          } else {
            if (modal.hasClass('active')) {
              modal.removeClass('active');
            }
          }
        });
      }
    };
  }]);
})(window.angular);