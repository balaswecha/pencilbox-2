"use strict";

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

db.put(ddoc);

db.allDocs({include_docs: true, descending: true}, function (err, doc) {
    if (err) {
        populateInitialData();
    }
    if(doc.rows.map(function(r) { return r.doc; }).filter(function(r){return typeof r.grade !== 'undefined'}).length<1){
        populateInitialData();
    }
});

pencilBoxApp.factory('Grades', ['$q', function ($q) {
    return {
        queryAndKeepUpdated: function(callback) {
            var fetch = function() {
                db.allDocs({include_docs: true, descending: true}, function (err, doc) {
                    if (err) {
                        console.log('ERROR', err);
                    }
                    callback(doc.rows.map(function(r) { return r.doc; }).filter(function(r){return typeof r.grade !== 'undefined'}));
                });
            };

            sync.on('change', function() {
                fetch();
            });
            fetch();
        },
        get: function(slug){
            slug = slug.toString();
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

pencilBoxApp.factory('AllSubjects', ['$resource',
    function($resource){
        return $resource('json/subjects/:subject/:topic.json', {}, {
            query: {method:'GET', isArray:true }
        });
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

pencilBoxApp.factory('Contents', ['Grades', 'Subjects', 'Chapters', '$route', function (Grades, Subjects, Chapters, $route) {
    var getCurrentChapter = function(gradeDoc, subject, chapter){
        return gradeDoc.subjects.find(function(s) {
               return s.slug == subject;
           }).chapters.find(function(c) {
               return c.slug == chapter;
           });
    };
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
                    var chapter = getCurrentChapter(grade, data.subject, data.chapter);
                    chapter.contents.push(data.quiz);
                    Grades.put(grade);
                    $route.reload();
                });
        },
        deleteQuiz: function(data) {
            return Grades.get(data.grade)
                .then(function(grade){
                    var chapter = getCurrentChapter(grade, data.subject, data.chapter);
                    chapter.contents = chapter.contents.filter(function(content){
                        return content.type!=="quiz" || content.name!==data.name;
                    });
                    Grades.put(grade);
                    $route.reload();
                });
        }
    };
}]);

pencilBoxApp.factory('Apps', ['$resource', function ($resource) {
    return $resource('json/all.json', {}, {
        query: {method: 'GET', isArray: true}
    });
}]);
