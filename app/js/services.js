
"use strict";

pencilBoxApp.factory('Grades', ['$resource', function($resource) {
    return $resource('json/grades.json', {}, {
        query: {method:'GET', isArray:true }
    });
}]);

pencilBoxApp.factory('Subjects', ['$resource', function($resource) {
    return $resource('json/:gradeId/subjects.json', {}, {
        query: {method:'GET', isArray:true }
    });
}]);

pencilBoxApp.factory('Chapters', ['$resource', function($resource) {
    return $resource('json/:gradeId/:subjectId/chapters.json', {}, {
        query: {method:'GET', isArray:true }
    });
}]);

pencilBoxApp.factory('Contents', ['$resource', function($resource) {
    return $resource('json/:gradeId/:subjectId/:chapterId.json', {}, {
        query: {method: 'GET', isArray:true }
    });
}]);

pencilBoxApp.factory('CreateQuiz', ['$resource', function($resource) {
    return $resource('json/create-quiz.json', {}, {
        query: {method: 'GET', isObject:true }
    });
}]);

pencilBoxApp.factory('TakeQuiz', ['$resource', function($resource) {
    return $resource('json/create-quiz.json', {}, {
        query: {method: 'GET', isObject:true }
    });
}]);

pencilBoxApp.factory('Apps', ['$resource', function($resource) {
    return $resource('json/all.json', {}, {
        query: {method:'GET', isArray:true }
    });
}]);
