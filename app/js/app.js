var pencilBoxApp = angular.module('pencilBoxApp',['ngResource', 'ngRoute', 'dndLists']);

var db = new PouchDB('grades');
var remoteCouch = 'http://localhost:5984/grades';
var opts = {live: true};
var sync = PouchDB.sync('grades', remoteCouch, opts);

// create a design doc
var ddoc = {
  _id: '_design/gradeSlug',
  views: {
    gradeSlug: {
      map: function mapFun(doc) {
        if (doc.grade) {
          emit(doc.grade);
        }
      }.toString()
    }
  }
};

db.info().then(function(data){
  if(data.doc_count == 0){
    populateInitialData();
  }
});

db.put(ddoc);

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
  .when('/search/:keyword', {
    templateUrl: 'partials/search-results-view.html',
    controller: 'SearchResultController'
  })
  .otherwise({
    redirectTo: '/grades'
  });
}]);
