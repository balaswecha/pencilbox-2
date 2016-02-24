pencilBoxApp.directive('scrollTo', function() {
    return {
        restrict: 'A',
        link: function(scope, element, attr){

            element.bind('click', function() {
                var container = document.getElementById(attr.container);
                var target = document.getElementById(attr.target);

                container.scrollTop = target.offsetTop - container.offsetTop;
            });
        }
    };
});