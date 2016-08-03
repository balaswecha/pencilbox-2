pencilBoxApp.directive('search', function () {
    return {
        templateUrl: 'partials/search.html',
        link: function(scope){
            scope.$watch('keyword', function() {
                if(scope.keyword!=undefined)
                    scope.url = '#/search/' + (scope.keyword || '');
                else
                    document.getElementsByClassName("search-submit").disabled = true
            })
        }
    };
});
