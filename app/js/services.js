"use strict";

var db = new PouchDB('grades');
var remoteCouch = 'http://localhost:5984/grades';
var opts = {live: true};
var sync = PouchDB.sync('grades', remoteCouch, opts);

pencilBoxApp.factory('Grades', ['$q', function ($q) {
    return {
        callback: function(callback) {
            sync.on('change', function() {
                callback();
            });
            callback();
        },
        query: function () {
            return $q(function (resolve, reject) {
                db.allDocs({include_docs: true, descending: true}, function (err, doc) {
                    if (err) {
                        return reject(err);
                    }
                    resolve(doc.rows.map(function(r) { return r.doc; }));
                })
            });
        }
    }
}]);

pencilBoxApp.factory('Subjects', ['$resource', function ($resource) {
    return $resource('json/:gradeId/subjects.json', {}, {
        query: {method: 'GET', isArray: true}
    });
}]);

pencilBoxApp.factory('Chapters', ['$resource', function ($resource) {
    return $resource('json/:gradeId/:subjectId/chapters.json', {}, {
        query: {method: 'GET', isArray: true}
    });
}]);

pencilBoxApp.factory('Contents', ['$resource', function ($resource) {
    return $resource('json/:gradeId/:subjectId/:chapterId.json', {}, {
        query: {method: 'GET', isArray: true}
    });
}]);

pencilBoxApp.factory('CreateQuiz', ['$resource', function ($resource) {
    return $resource('json/create-quiz.json', {}, {
        query: {method: 'GET', isObject: true}
    });
}]);

pencilBoxApp.factory('TakeQuiz', ['$resource', function ($resource) {
    return $resource('json/create-quiz.json', {}, {
        query: {method: 'GET', isObject: true}
    });
}]);

pencilBoxApp.factory('Apps', ['$resource', function ($resource) {
    return $resource('json/all.json', {}, {
        query: {method: 'GET', isArray: true}
    });
}]);
