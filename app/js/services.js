"use strict";

var db = new PouchDB('grades');
var remoteCouch = 'http://localhost:5984/grades';
var remoteDb = new PouchDB(remoteCouch);
var opts = {live: true};
var sync = PouchDB.sync('grades', remoteCouch, opts);

// create a design doc
var ddoc = {
  _id: '_design/gradeSlug',
  views: {
    gradeSlug: {
      map: function mapFun(doc) {if (doc.grade) {emit(doc.grade);}}.toString()
    }
  }
}

db.put(ddoc);

pencilBoxApp.factory('Grades', ['$q', function ($q) {
    return {
        queryAndKeepUpdated: function(callback) {
            var fetch = function() {
                remoteDb.allDocs({include_docs:true}).then(function(doc){
                    var grades = doc.rows.map(function(r) { return r.doc; })
                                        .filter(function(r){return typeof r.grade !== 'undefined'});
                    grades.forEach(function(grade){
                        delete grade['_id'];
                        delete grade['_rev'];
                        FileIO.writeToFile('app/json/' + grade.grade + '.json', JSON.stringify(grade));
                    });
                    callback(grades);
                }).catch(function(err){
                    db.allDocs({include_docs:true}).then(function(doc){
                        var grades = doc.rows.map(function(r) { return r.doc; })
                                            .filter(function(r){return typeof r.grade !== 'undefined'});
                        if(grades.length===0){
                            var gradesList = JSON.parse(FileIO.readFromFile('app/json/grades.json'));
                            var gradesFromFile = [];
                            gradesList.forEach(function(grade){
                                var gradeDoc = JSON.parse(FileIO.readFromFile('app/json/' + grade.slug + '.json'));
                                db.post(gradeDoc);
                                gradesFromFile.push(gradeDoc);
                            });
                            callback(gradesFromFile);
                        }else{
                            callback(grades);
                        }
                    });
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
                });
        }
    };
}]);

pencilBoxApp.factory('Apps', ['$resource', function ($resource) {
    return $resource('json/all.json', {}, {
        query: {method: 'GET', isArray: true}
    });
}]);
