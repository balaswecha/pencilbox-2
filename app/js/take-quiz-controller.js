pencilBoxApp.controller('TakeQuizController', ['$scope', '$routeParams', 'Contents', '$q', '$timeout',
    function ($scope, $routeParams, Contents, $q, $timeout) {
        $scope.current_grade = $routeParams.gradeId;
        $scope.current_subject = $routeParams.subjectId;
        $scope.current_chapter = $routeParams.chapterId;

        $scope.contents = Contents.query({
            chapterId: $routeParams.chapterId,
            subjectId: $routeParams.subjectId, gradeId: $routeParams.gradeId
        }, function () {
            $scope.quizJson = $scope.contents[$routeParams.id];
            $scope.shuffleQuestions();
            $scope.preprocessJson();
            $scope.initQuiz();
        });

        $scope.shuffleQuestions = function () {
            $scope.quizJson.questions = shuffle($scope.quizJson.questions);

            function shuffle(array) {
                var currentIndex = array.length, temporaryValue, randomIndex;
                while (0 !== currentIndex) {
                    randomIndex = Math.floor(Math.random() * currentIndex);
                    currentIndex -= 1;
                    temporaryValue = array[currentIndex];
                    array[currentIndex] = array[randomIndex];
                    array[randomIndex] = temporaryValue;
                }
                return array;
            }
        }
        $scope.preprocessJson = function () {
            for (var i = 0, length = $scope.quizJson.questions.length; i < length; i++) {
                $scope.quizJson.questions[i].hasAnswered = false;
                if ($scope.quizJson.questions[i].type === "fill-the-blanks") {
                    var collection = $scope.quizJson.questions[i].questionCollection;
                    for (var j = 0; j < collection.length; j++) {
                        if (collection[j].type === "answer") {
                            collection[j].correctAnswer = collection[j].value;
                            collection[j].value = "";
                        }
                    }
                } else if ($scope.quizJson.questions[i].type === "multiple-options") {
                    var answers = []
                    for (var j = 0; j < $scope.quizJson.questions[i].options.length; j++) {
                        $scope.quizJson.questions[i].options[j].correctAnswer = angular.copy($scope.quizJson.questions[i].options[j].answer);
                        if ($scope.quizJson.questions[i].options[j].correctAnswer) {
                            answers.push(true);
                        }
                        $scope.quizJson.questions[i].options[j].answer = false
                    }
                    $scope.quizJson.questions[i].isCheckbox = answers.length > 1;

                    if (!$scope.quizJson.questions[i].isCheckbox) {
                        $scope.quizJson.questions[i].selectedAnswer = -1;
                    }
                } else if ($scope.quizJson.questions[i].type === "match-the-following") {
                    var random = $scope.generateRandom($scope.quizJson.questions[i].questions.length);
                    var questions = angular.copy($scope.quizJson.questions[i].questions);

                    $scope.quizJson.questions[i].answers = [];
                    for (var j = 0; j < questions.length; j++) {
                        questions[j].answer = $scope.quizJson.questions[i].questions[random[j]].answer;
                        questions[j].correctAnswer = $scope.quizJson.questions[i].questions[j].answer;
                        $scope.quizJson.questions[i].answers.push([]);
                    }
                    $scope.quizJson.questions[i].questions = questions;
                    $scope.quizJson.questions[i].answerBucket = angular.copy(questions);
                    for (var j = 0; j < questions.length; j++) {
                        $scope.quizJson.questions[i].questions[j].answer = '';
                    }
                }
            }
        }

        $scope.initQuiz = function () {
            if ($scope.quizJson.questions.length === 0) {
                return;
            }
            $scope.selectQuestion();
        }

        $scope.selectQuestion = function (index) {
            index = typeof index != 'undefined' && index != null ? index : 0;
            $scope.selectedQuestion = index;
            $scope.currentQuestion = $scope.quizJson.questions[$scope.selectedQuestion];
            $scope.currentQuestionType = $scope.currentQuestion.type;
            console.log($scope.currentQuestion)
        }

        $scope.navigateQuestion = function (position) {
            var index = $scope.selectedQuestion + position;
            if ($scope.quizJson.questions.length > index && 0 <= index) {
                $scope.selectQuestion(index);
            }
        }

        $scope.generateRandom = function (max) {
            var numbers = [];
            for (var i = 0; i < max; i++) {
                numbers.push(i);
            }
            function shuffle(o) {
                for (var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
                return o;
            }

            return shuffle(numbers);
        }

        $scope.hasAnswered = function (type, index) {
            if (type) {
                $scope.setRadioValues(index);
            }

            if ($scope.currentQuestion.type === "fill-the-blanks") {
                var collection = $scope.currentQuestion.questionCollection, found = false;
                for (var j = 0; j < collection.length; j++) {
                    if (collection[j].type === "answer" && collection[j].value !== "") {
                        found = true;
                    }
                }
                $scope.currentQuestion.hasAnswered = found;
            } else if ($scope.currentQuestion.type === "multiple-options") {
                var found = false;
                for (var j = 0; j < $scope.currentQuestion.options.length; j++) {
                    if ($scope.currentQuestion.options[j].answer === true) {
                        found = true;
                        break;
                    }
                }
                $scope.currentQuestion.hasAnswered = found;
            }
        }

        $scope.setRadioValues = function (index) {
            for (var j = 0; j < $scope.currentQuestion.options.length; j++) {
                $scope.currentQuestion.options[j].answer = false;
                if (index == j) {
                    $scope.currentQuestion.options[j].answer = true;
                }
            }
        }

        var getMarksFor = function (question) {
            var answered;
            if (question.type == "fill-the-blanks") {
                answered = question.questionCollection
                        .filter(function (q) {
                            return q.type === 'answer'
                        })
                        .map(function (q) {
                            if (!q.value) return false;
                            return q.value.toLowerCase() === q.correctAnswer.toLowerCase();
                        }).reduce(function (res, i) {
                            return res && i
                        }, true);
            } else if (question.type == "multiple-options") {
                answered = question.options.map(function (q) {
                    return q.answer === q.correctAnswer;
                }).reduce(function (res, i) {
                    return res && i
                }, true);
            } else if (question.type == "match-the-following") {
                answered = question.questions.map(function (q) {
                    return q.answer.toLowerCase() === q.correctAnswer.toLowerCase();
                }).reduce(function (res, i) {
                    return res && i
                }, true);
            }
            question.correct = answered;
            return answered ? question.marks : 0;
        };

        $scope.processMatchTheFollowing = function () {
            $scope.quizJson.questions
                    .forEach(function (question) {
                        if (question.type !== 'match-the-following') return;
                        question.questions.forEach(function (q, i) {
                            q.answer = question.answers[i][0] ? question.answers[i][0].answer : '';
                        });
                    });
        };

        $scope.submitQuiz = function () {
            var options = {
                title: "Confirm",
                description: "Are you sure you want to submit quiz?",
                className: "master-password",
                buttons: ["ok", "cancel"],
                closeHandler: true
            };
            new CustomDialog($q, options).show().then(function () {
                $scope.processMatchTheFollowing();
                $scope.totalMarks = $scope.quizJson.questions.map(function (question) {
                    return question.marks;
                }).reduce(function (sum, i) {
                    return sum + i
                }, 0);

                $scope.marks = $scope.quizJson.questions.map(function (question) {
                    return getMarksFor(question);
                }).reduce(function (sum, i) {
                    return sum + i
                }, 0);
                $scope.showScore = true;
            }).catch(function () {
            });
        };

        $scope.onInsert = function (index, droppedAnswer) {
            if ($scope.currentQuestion.answers[index].length <= 1) return;
            console.log(droppedAnswer);
            var replacedAnswers = $scope.currentQuestion.answers[index].filter(function (answer) {
                return answer !== droppedAnswer;
            });
            $scope.currentQuestion.answers[index] = [droppedAnswer];
            $timeout(function () {
                $scope.currentQuestion.answerBucket = $scope.currentQuestion.answerBucket.concat(replacedAnswers);
            }, 100);
        }

        $scope.closeOverlay = function ($event) {
            $event.preventDefault();
            if($scope.showScore){
                window.location.href = "#/grades/" + $scope.current_grade + "/subject/" + $scope.current_subject + "/" + $scope.current_chapter + "/";
                return;
            }
            var options = {
                title: "Changes not saved",
                description: "All your data will be lost. Are you sure you want to close the quiz?",
                className: "master-password",
                buttons: ["ok", "cancel"],
                buttonName: ["yes", "no"],
                closeHandler: true
            };
            new CustomDialog($q, options).show().then(function () {
                window.location.href = "#/grades/" + $scope.current_grade + "/subject/" + $scope.current_subject + "/" + $scope.current_chapter + "/";
            }).catch(function () {

            });
        };
    }
]);
