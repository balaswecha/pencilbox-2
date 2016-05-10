"use strict";
// pencilBoxApp.controller('SubjectListController',['$scope','Subjects',
//   function($scope, Subjects){
//     $scope.subjects = Subjects.query();
//   }]);

pencilBoxApp.controller('GradeListController', ['$scope', 'Grades', '$timeout',
    function ($scope, Grades, $timeout) {
        Grades.queryAndKeepUpdated(function(grades) {
            $timeout(function() {
                $scope.grades = grades;
            }, 0);
        });
    }]);

pencilBoxApp.controller('SubjectListController', ['$scope', '$routeParams', 'Subjects', '$timeout',
    function ($scope, $routeParams, Subjects, $timeout) {
        $scope.current_grade = $routeParams.gradeId;
        Subjects.queryAndKeepUpdated($scope.current_grade, function(subjects) {
            $timeout(function() {
                $scope.subjects = subjects;
                $scope.current_subject = $scope.subjects[0] ? $scope.subjects[0].slug : "";
            }, 0);
        });

        $scope.isCurrentSubject = function (subject) {
            return $scope.current_subject.toLowerCase() === subject.toLowerCase();
        };
        $scope.isNotCurrentSubject = function (subject) {
            return $scope.current_subject.toLowerCase() !== subject.toLowerCase();
        };
    }]);

pencilBoxApp.controller('ChapterListController', ['$scope', '$routeParams', 'Chapters', 'Subjects', '$timeout',
    function ($scope, $routeParams, Chapters, Subjects, $timeout) {
        $scope.current_grade = $routeParams.gradeId;
        $scope.current_subject = $routeParams.subjectId;

        Subjects.queryAndKeepUpdated($scope.current_grade, function(subjects) {
            $timeout(function() {
                $scope.subjects = subjects;
            }, 0);
        });
        Chapters.queryAndKeepUpdated($scope.current_grade, $scope.current_subject, function(chapters) {
            $timeout(function() {
                $scope.chapters = chapters;
            });
        });
        $scope.isCurrentSubject = function (subject) {
            return $scope.current_subject.toLowerCase() === subject.toLowerCase();
        };
        $scope.isNotCurrentSubject = function (subject) {
            return $scope.current_subject.toLowerCase() !== subject.toLowerCase();
        };
    }]);

pencilBoxApp.controller('ContentListController', ['$scope', '$routeParams', 'Contents', 'Chapters', 'Subjects', '$location', '$timeout', '$sce', '$q',
    function ($scope, $routeParams, Contents, Chapters, Subjects, $location, $timeout, $sce, $q) {
        $scope.current_grade = $routeParams.gradeId;
        $scope.current_subject = $routeParams.subjectId;
        $scope.current_chapter = $routeParams.chapterId;
        $scope.subjects = [];
        $scope.chapters = [];
        $scope.contents = [];
        $scope.currentPath = function () {
            return $location.path();
        };
        Subjects.queryAndKeepUpdated($scope.current_grade, function(subjects) {
            $timeout(function() {
                $scope.subjects = subjects;
            }, 0);
        });
        Chapters.queryAndKeepUpdated($scope.current_grade, $scope.current_subject, function(chapters) {
            $timeout(function() {
                $scope.chapters = chapters;
            });
        });
        Contents.queryAndKeepUpdated($scope.current_grade, $scope.current_subject, $scope.current_chapter, function(contents) {
            $timeout(function() {
                $scope.contents = contents;
            });
        });

        $scope.selectedApp = null;
        $scope.selectApp = function (app) {
            $scope.selectedApp = app;
        };
        $scope.deselectApp = function () {
            $scope.selectedApp = null;
        };

        $scope.showOverlay = function (type, content) {
            var innerHTML = "";
            var overlay = new Overlay();
            overlay.setMaskClassName(type);
            if (type === "videos") {
                var videoName = 'videos/' + content.id + '.mp4';
                innerHTML = "<div id='overlayContent'>" +
                        "<video id='video' controls autoplay src='" + videoName + "' class='video'></video>" +
                        "</div>";
                overlay.setContent(innerHTML);
                document.getElementById('video').style.height = (document.querySelector('#mask .overlay').offsetHeight - 25) + 'px';
            }
        };
        $scope.isCurrentSubject = function (subject) {
            return $scope.current_subject.toLowerCase() === subject.toLowerCase();
        };
        $scope.isNotCurrentSubject = function (subject) {
            return $scope.current_subject.toLowerCase() !== subject.toLowerCase();
        };
        $scope.isCurrentChapter = function (chapter) {
            return $scope.current_chapter.toLowerCase() === chapter.toLowerCase();
        };
        $scope.isNotCurrentChapter = function (chapter) {
            return $scope.current_chapter.toLowerCase() !== chapter.toLowerCase();
        };
        $scope.invokeCommand = function (command) {
            CommandApi.invokeCommand(command);
        };
        $scope.isApplication = function (type) {
            return type === "apps";
        };
        $scope.isVideo = function (type) {
            return type === "videos";
        };
        $scope.isQuiz = function (type) {
            return type === "quiz";
        };

        $scope.adminPasswordDialog = function ($event, redirect, callback) {
            if ($event) {
                $event.preventDefault();
            }
            var options = {
                title: "Alert",
                description: "Please enter the master password",
                className: "master-password",
                buttons: ["ok", "cancel"],
                closeHandler: true,
                callback: function (event) {
                    if (event.context.inputText === "admin") {
                        event.context.disposeOverlay();
                        if (redirect) {
                            var url = window.location.origin + window.location.pathname + window.location.hash + "create-quiz";
                            window.location = url;
                        }
                        if (callback) callback();
                    } else {
                        var error = document.createElement('p');
                        error.className = 'error';
                        error.innerHTML = "Incorrect password";
                        var container = event.context.input.parentElement.parentElement;
                        if (!container.querySelector('.error')) {
                            container.appendChild(error);
                        }
                    }
                },
                inputCheck: true,
                placeholder: 'Enter your password'
            };
            new CustomDialog($q, options);
            return true;
        };

        $scope.verifyPassword = function ($event) {
            var password = prompt("Enter the Master Password", '');
            if (password == null) {
                $event && $event.preventDefault();
                return false;
            }
            if (password !== "admin") {
                $event && $event.preventDefault();
                alert("Wrong Master Password");
                return false;
            }
            return true;
        };

        $scope.uploadFile = function (data) {
            var requestJson = {
                grade: $scope.current_grade,
                subject: $scope.current_subject,
                chapter: $scope.current_chapter,
                quiz: data
            };
            if ($scope.contents.filter(function (c) {
                        return c.type === 'quiz' && (c.name || '').toLowerCase().trim() === data.name.toLowerCase().trim();
                    }).length > 0) {
                var options = {
                    title: "Alert",
                    description: "Quiz with same name already present cannot upload the quiz.",
                    buttons: ["ok"]
                };
                new CustomDialog($q, options);
            } else {
                requestJson.quiz.type = 'quiz';
                Contents.addQuiz(requestJson);
            }
        };

        $scope.deleteQuiz = function (index) {
            $scope.adminPasswordDialog(null, null, function () {
                var requestJson = {
                    grade: $scope.current_grade,
                    subject: $scope.current_subject,
                    chapter: $scope.current_chapter,
                    name: $scope.contents[index].name
                };
                Contents.deleteQuiz(requestJson);
            });
        };

        $scope.downloadQuiz = function (index) {
            var fileName = FileIO.getUserHome() + "/Desktop/" + $scope.contents[index]['name'] + '.bsquiz';
            var fileContents = JSON.stringify($scope.contents[index]);
            FileIO.writeToFile(fileName, fileContents);
            new CustomDialog($q, {
                title: "Alert",
                description: "The quiz has been saved as " + fileName + " on the Desktop.",
                buttons: ["ok"]
            });
        };

        $scope.handleModalContentClick = function (e) {
            e.stopPropagation();
        };

        $scope.hasApplications = function (contents) {
            return contents.filter(function (content) {
                        return (content.type === 'apps');
                    }).length > 0;
        };

        $scope.hasVideos = function (contents) {
            return contents.filter(function (content) {
                        return (content.type === 'videos');
                    }).length > 0;
        };

        $scope.isPlaying = false;
        $scope.$watch('isPlaying', function(isPlaying) {
            var player = document.querySelector('#player');
            if(isPlaying) {
                player.play();
            } else {
                player.pause();
            }
        });
    }]);

pencilBoxApp.controller('OtherAppController', ['$scope', 'OtherApps',
    function ($scope, OtherApps) {
        $scope.otherApps = OtherApps.query();
    }]);
pencilBoxApp.controller('SearchResultController', ['$scope', '$routeParams', 'Apps',
    function ($scope, $routeParams, Apps) {
        $scope.keyword = $routeParams.keyword;
        $scope.apps = Apps.query();
        $scope.invokeCommand = function (command) {
            CommandApi.invokeCommand(command);
        };

        $scope.selectedApp = null;
        $scope.selectApp = function (app) {
            $scope.selectedApp = app;
        };
        $scope.deselectApp = function () {
            $scope.selectedApp = null;
        };
        $scope.handleModalContentClick = function (e) {
            e.stopPropagation();
        };

        $scope.isPlaying = false;
        $scope.$watch('isPlaying', function(isPlaying) {
            var player = document.querySelector('#player');
            if(isPlaying) {
                player.play();
            } else {
                player.pause();
            }
        });
    }]);
