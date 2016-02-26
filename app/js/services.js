"use strict";

var db = new PouchDB('grades');
var remoteCouch = 'http://localhost:5984/grades';
var opts = {live: true};
var sync = PouchDB.sync('grades', remoteCouch, opts);

pencilBoxApp.factory('Grades', ['$q', function ($q) {
    return {
        queryAndKeepUpdated: function(callback) {
            var fetch = function() {
                db.allDocs({include_docs: true, descending: true}, function (err, doc) {
                    if (err) {
                        console.log('ERROR', err);
                    }
                    callback(doc.rows.map(function(r) { return r.doc; }));
                });
            };

            sync.on('change', function() {
                fetch();
            });
            fetch();
        },
        get: function(slug){
            slug = +slug;
            return $q(function(resolve, reject) {
                db.query('gradeSlug', {
                    key: slug,
                    include_docs: true
                }).then(function(result) {
                    resolve(result.rows[0] && result.rows[0].doc);
                }).catch(function(err) {
                    reject(err);
                });
            });
        },
        put: function(grade) {
            return db.put(grade);
        }
    }
}]);

pencilBoxApp.factory('Subjects', ['Grades', function (Grades) {
    return {
        queryAndKeepUpdated: function(grade, callback) {
            Grades.queryAndKeepUpdated(function(grades) {
                var currentGrade = grades.filter(function(g) {return g.grade == grade})[0];
                callback(currentGrade && currentGrade.subjects || []);
            });
        }
    };
}]);

pencilBoxApp.factory('Chapters', ['Subjects', function (Subjects) {
    return {
        queryAndKeepUpdated: function(grade, subject, callback) {
            Subjects.queryAndKeepUpdated(grade, function(subjects) {
                var currentSubject = subjects.filter(function(s) { return s.slug === subject })[0];
                callback(currentSubject && currentSubject.chapters || []);
            });
        }
    };
}]);

pencilBoxApp.factory('Contents', ['Grades', 'Subjects', 'Chapters', function (Grades, Subjects, Chapters) {
    return {
        queryAndKeepUpdated: function(grade, subject, chapter, callback) {
            Chapters.queryAndKeepUpdated(grade, subject, function(chapters) {
                var currentChapter = chapters.filter(function(c) { return c.slug === chapter })[0];
                callback(currentChapter && currentChapter.contents || []);
            });
        },
        addQuiz: function(data) {
            return Grades.get(data.grade)
                    .then(function(grade){
                        var chapter = grade.subjects.find(function(s) {
                            return s.slug == data.subject;
                        }).chapters.find(function(c) {
                            return c.slug == data.chapter;
                        });
                        chapter.contents.push(data.quiz);
                        Grades.put(grade);
                    })
        }
    };
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
