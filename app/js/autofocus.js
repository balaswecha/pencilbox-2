pencilBoxApp.directive('ngautofocus', ['$timeout', function ($timeout) {
    return {
        restrict: 'A',
        link: function ($scope, $element) {
            console.log('sattar');
            $timeout(function () {
                $element[0].focus();
            });
        }
    }
}]);
