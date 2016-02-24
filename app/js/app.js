var pencilBoxApp = angular.module('pencilBoxApp',['ngResource', 'ngRoute', 'dndLists']);

pencilBoxApp.config(['$routeProvider',function($routeProvider){
  "use strict";

  $routeProvider.when('/grades',{
    templateUrl : 'partials/home-view.html',
    controller: 'GradeListController'
  })
  .when('/grades/:gradeId', {
    templateUrl: 'partials/subjects-view.html',
    controller: 'SubjectListController'
  })
  .when('/grades/:gradeId/subject/:subjectId/',{
    templateUrl: 'partials/chapters-view.html',
    controller: 'ChapterListController'
  })
  .when('/grades/:gradeId/subject/:subjectId/:chapterId/',{
    templateUrl:'partials/contents-view.html',
    controller:'ContentListController'
  })
  .when('/grades/:gradeId/subject/:subjectId/:videoId/',{
    templateUrl:'partials/contents-view.html',
    controller:'ContentListController'
  })
  .when('/grades/:gradeId/subject/:subjectId/:chapterId/create-quiz/',{
    templateUrl:'partials/create-quiz.html',
    controller:'CreateQuizController'
  })
  .when('/grades/:gradeId/subject/:subjectId/:chapterId/update-quiz/', {
    templateUrl:'partials/update-quiz.html',
    controller:'CreateQuizController'
  })
  .when('/grades/:gradeId/subject/:subjectId/:chapterId/take-quiz/:id', {
    templateUrl:'partials/take-quiz.html',
    controller:'TakeQuizController'
  })
  .when('/search/:keyword?', {
    templateUrl: 'partials/search-results-view.html',
    controller: 'SearchResultController'
  })
  .otherwise({
    redirectTo: '/grades'
  });
}]);
