pencilBoxApp.directive('search', function () {
    return {
        templateUrl: '../app/partials/search.html',
        link: function(scope){
            scope.$watch('keyword', function() {
                scope.url = '#/search/' + (scope.keyword || '');
            })
        }
    };
});
