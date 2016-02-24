pencilBoxApp.controller('CreateQuizController', ['$scope', '$routeParams', 'Contents', 'CreateQuiz', '$http', '$q', '$timeout',
    function ($scope, $routeParams, Contents, CreateQuiz, $http, $q, $timeout) {
        $scope.hasChange = false;
        $scope.hasError = false;
        $scope.current_grade = $routeParams.gradeId;
        $scope.current_subject = $routeParams.subjectId;
        $scope.current_chapter = $routeParams.chapterId;
        $scope.contents = Contents.query({
            chapterId: $routeParams.chapterId,
            subjectId: $routeParams.subjectId, gradeId: $routeParams.gradeId
        });

        $scope.questionTypes = {
            "fill-the-blanks": {
                "name": "Fill the blanks",
                "image": "fill-the-blanks.png",
                "type": "fill-the-blanks",
                defaultQuestion: {
                    "type": "fill-the-blanks",
                    "question": "",
                    "questionCollection": [],
                    "marks": 1
                }
            },
            "multiple-options": {
                "name": "Multiple options",
                "image": "multiple-options.png",
                "type": "multiple-options",
                defaultQuestion: {
                    "marks": 1,
                    "type": "multiple-options",
                    "question": "",
                    "options": [
                        {
                            "value": "",
                            "answer": false
                        },
                        {
                            "value": "",
                            "answer": false
                        }
                    ]
                }
            },
            "match-the-following": {
                "name": "Match the following",
                "image": "match-the-following.png",
                "type": "match-the-following",
                defaultQuestion: {
                    "marks": 1,
                    "type": "match-the-following",
                    "questions": [
                        {
                            "question": "",
                            "answer": ""
                        },
                        {
                            "question": "",
                            "answer": ""
                        }
                    ]
                }
            }
        };

        var getDefaultQuestion = function (type) {
            return angular.copy($scope.questionTypes[type].defaultQuestion);
        };

        $scope.quizJson = {questions: [getDefaultQuestion('fill-the-blanks')]};
        $scope.currentQuestionIndex = 0;


        $scope.showOverlay = function (element) {
            $scope.overlay = new Overlay(element, {closeHandler: true});
        };

        $scope.closeQuiz = function ($event) {
            $event.preventDefault();
            var options = {
                title: "Changes not saved",
                description: "You have unsaved changes in the quiz. Do you want to save it?",
                className: "master-password",
                buttons: ["ok", "cancel"],
                buttonName: ["yes", "no"],
                closeHandler: true
            };
            new CustomDialog($q, options).show().then(function () {
                $scope.verifySaveQuiz();
            }).catch(function () {
                $scope.closeOverlay();
            });
        };

        $scope.closeOverlay = function ($event) {
            $scope.overlay.disposeOverlay();
            var url = window.location.href;
            url = url.replace("update-quiz/", "");
            url = url.replace("create-quiz/", "");
            window.location.href = url.replace("update-quiz/", "");
        };

        $scope.overlayLoaded = function () {
            $scope.showOverlay(document.getElementById("create-quiz-mask"));
        };

        $scope.getCurrentQuestionObject = function (index) {
            if (typeof index != "undefined") {
                return $scope.quizJson.questions[index];
            }
            return getDefaultQuestion($scope.currentQuestion.type);
        };

        $scope.addRow = function () {
            if ($scope.currentQuestion.type === "multiple-options") {
                if ($scope.currentQuestion.options.length < 5) {
                    $scope.currentQuestion.options.push({"value": "", "answer": false});
                } else {
                    var options = {
                        title: "Alert",
                        description: "Cannot add more than 5 options",
                        buttons: ["ok"]
                    };
                    new CustomDialog($q, options);
                }
            } else {
                if ($scope.currentQuestion.questions.length < 10) {
                    $scope.currentQuestion.questions.push({"question": "", "answer": ""});
                } else {
                    options = {
                        title: "Alert",
                        description: "Cannot add more than 10 options",
                        buttons: ["ok"]
                    };
                    new CustomDialog($q, options);
                }
            }
            $scope.isValidMultipleOption();
        };
        $scope.deleteRow = function (index) {
            var key = $scope.currentQuestion.type === "multiple-options" ? "options" : "questions";
            if ($scope.currentQuestion[key].length > 2) {
                $scope.currentQuestion[key].splice(index, 1);
            }
            $scope.isValidMultipleOption();
        };

        $scope.saveQuestion = function () {
            if ($scope.hasError()) {
                var options = {
                    title: "Alert",
                    description: "Please fill the red field",
                    buttons: ["ok"]
                };
                new CustomDialog($q, options);
                return false;
            }

            if ($scope.currentQuestion.type === "fill-the-blanks") {
                // Converting into question collection

                var splits = $scope.currentQuestion.question.split('__');
                $scope.currentQuestion.questionCollection = splits.map(function (el, i) {
                    if (i % 2 == 0) {
                        return {type: "question", value: el.trim()};
                    } else {
                        return {type: "answer", value: el.trim()};
                    }
                });
            }

            $scope.currentQuestionIndex = $scope.quizJson.questions.length - 1;
            return true;
        };

        var refreshCurrentQuestion = function () {
            $scope.currentQuestion = $scope.quizJson.questions[$scope.currentQuestionIndex];
        };
        $scope.$watch('currentQuestionIndex', refreshCurrentQuestion);

        $scope.addQuestion = function () {
            //if(!$scope.saveQuestion()) return;
            $scope.quizJson.questions.push($scope.getCurrentQuestionObject());
            $scope.currentQuestionIndex = $scope.quizJson.questions.length - 1;
            $scope.isValidMultipleOption();
        };

        $scope.hasError = function () {
            return document.querySelectorAll(".question-box .error, .question-box .ng-invalid").length > 0;
        };

        $scope.selectQuestion = function (index) {
            $scope.currentQuestionIndex = index;
        };

        var insertAt = function (mainString, insertString, index) {
            var leftPart = mainString.substr(0, index);
            var rightPart = mainString.substr(index, mainString.length);
            return leftPart + insertString + rightPart;
        };

        $scope.addBlank = function () {
            var answer;
            var caretPosition = document.getElementById('fill-in-the-blank-question').selectionStart;
            $scope.promptDialog(null, null, function (inputText) {
                if(!inputText){return;}
                answer = inputText;
                console.log(answer);
                $timeout(function () {
                    $scope.currentQuestion.question = insertAt($scope.currentQuestion.question, ' __' + answer + '__ ', caretPosition);
                }, 0);

            });
        };

        $scope.fillInTheBlankPreview = function () {
            if (!$scope.currentQuestion) return '';
            return $scope.currentQuestion.question ? $scope.currentQuestion.question.replace(/__.*?__/g, '_______') : "";
        };

        $scope.previousQuestion = function () {
            $scope.currentQuestionIndex = Math.max(0, $scope.currentQuestionIndex - 1);
        };
        $scope.nextQuestion = function () {
            $scope.currentQuestionIndex = Math.min($scope.quizJson.questions.length - 1, $scope.currentQuestionIndex + 1);
        };

        $scope.isValidMultipleOption = function () {
            if ($scope.currentQuestion.type === "multiple-options") {
                $scope.mcHasError = true;
                for (var i = 0, length = $scope.currentQuestion.options.length; i < length; i++) {
                    if ($scope.currentQuestion.options[i].answer) {
                        $scope.mcHasError = false;
                        break;
                    }
                }
            }
        };

        $scope.canDeleteQuestion = function () {
            return $scope.quizJson.questions.length > 1;
        };
        $scope.deleteQuestion = function () {
            if (!$scope.canDeleteQuestion()) return;
            var dialogInstance = new CustomDialog($q, {
                title: "Alert",
                description: "Are you sure you want to delete this question?",
                buttons: ["ok", "cancel"]
            }).show();
            dialogInstance
                    .then(function () {
                        $scope.quizJson.questions.splice($scope.currentQuestionIndex, 1);
                        if ($scope.currentQuestionIndex > $scope.quizJson.questions.length - 1) {
                            $scope.currentQuestionIndex = $scope.quizJson.questions.length - 1;
                        } else {
                            refreshCurrentQuestion();
                        }
                    })
                    .catch(function (e) {
                    });
        };

        $scope.isExistingQuestion = function () {
            return $scope.currentQuestionIndex;
        };

        $scope.errorsForQuestion = function (question) {
            if (question.type === "fill-the-blanks") {
                if (question.question.trim().length === 0) {
                    return "Please fill the question";
                } else if (!question.question.trim().match(/__[^_]+__/)) {
                    return "Please provide answer";
                }
            } else if (question.type === "match-the-following") {
                if (question.questions.filter(function (option) {
                            return option.question.trim() === '' || option.answer.trim() === ''
                        }).length > 0) {
                    return "Please fill all the fields.";
                }
            } else {
                if (question.question.trim().length === 0) {
                    return "Please fill the question";
                }
                else if (question.options.filter(function (option) {
                            return option.value.trim() === ''
                        }).length > 0) {
                    return "Please fill all the answer options.";
                }
                else if (question.options.filter(function (option) {
                            return option.answer
                        }).length <= 0) {
                    return "Please set answer to the question";
                }
            }
        };

        var processFib = function () {
            $scope.quizJson.questions.forEach(function (question) {
                if (question.type !== "fill-the-blanks") return;

                // Converting into question collection
                var splits = question.question.split('__');
                question.questionCollection = splits.map(function (el, i) {
                    return i % 2 == 0 ? {type: "question", value: el.trim()} : {type: "answer", value: el.trim()};
                });
            });
        };

        $scope.saveQuiz = function () {
            var data = {
                grade: $scope.current_grade,
                subject: $scope.current_subject,
                chapter: $scope.current_chapter,
                quiz: $scope.quizJson
            };
            $http.post('/save.php', data, {headers: {'Content-Type': 'application/json'}}).
                    then(function () {
                        $scope.hasChange = false;
                        $scope.closeOverlay();
                        var options = {
                            title: "Success",
                            description: "Successfully saved the quiz.",
                            buttons: ["ok"]
                        };
                        new CustomDialog($q, options);
                    }, function () {
                        console.log(arguments);
                    });
        };

        $scope.verifySaveQuiz = function () {
            var error = "";
            if (!$scope.quizJson.name) {
                error = "Please give a name to the Quiz";
            } else if ($scope.contents.filter(function (c) {
                        return c.type === 'quiz' && (c.name || '').toLowerCase().trim() === $scope.quizJson.name.toLowerCase().trim();
                    }).length > 0) {
                error = "Another quiz exists with this name, please choose another name.";
            } else {
                var firstInvalidQuestionIndex;
                $scope.quizJson.questions.some(function (question, i) {
                    if($scope.errorsForQuestion(question) === undefined) return false;

                    firstInvalidQuestionIndex = i;
                    return true;
                });

                if (firstInvalidQuestionIndex !== undefined && firstInvalidQuestionIndex !== -1) {
                    $scope.currentQuestionIndex = firstInvalidQuestionIndex;
                    error = $scope.errorsForQuestion($scope.quizJson.questions[firstInvalidQuestionIndex])
                }
            }
            if (error) {
                var options = {
                    title: "Alert",
                    description: error || "Please fill the red field",
                    buttons: ["ok"]
                };
                new CustomDialog($q, options);
            } else {
                processFib();
                var dialogInstance = new CustomDialog($q, {
                    title: "Alert",
                    description: "Once you save the quiz you cannot make any changes. Do you want to continue?",
                    buttons: ["ok", "cancel"],
                    buttonName: ["yes", "no"]
                }).show();
                dialogInstance.then(function () {
                    $scope.saveQuiz();
                }).catch(function (e) {
                });
            }
        };

        $scope.validateInput = function (obj, limit) {
            if (obj.length >= limit) {
                var options = {
                    title: "Alert",
                    description: "You cannot add more than " + limit + " characters",
                    buttons: ["ok"]
                };
                new CustomDialog($q, options);
            }
        };

        $scope.setQuestionType = function (questionType) {
            var setType = function () {
                $scope.currentQuestion = $scope.quizJson.questions[$scope.currentQuestionIndex] = getDefaultQuestion(questionType);
            };
            if (($scope.currentQuestion.question && $scope.currentQuestion.question.trim())
                    || ($scope.currentQuestion.questions && $scope.currentQuestion.questions.filter(function (q) {
                        return q.question || q.answer;
                    }).length > 0)) {
                new CustomDialog($q, {
                    title: "Confirm",
                    description: "You have entered question details. If you change the type, they'll be lost. Do you want to continue?",
                    buttons: ["ok", "cancel"]
                }).show().then(setType);
            } else {
                setType();
            }
        }

        $scope.promptDialog = function ($event, redirect, callbackFn) {
            if ($event) {
                $event.preventDefault();
            }
            var options = {
                title: "Alert",
                description: "Enter the answer for the blank.",
                plainText: true,
                buttons: ["ok", "cancel"],
                closeHandler: true,
                callback: function (event) {
                    callbackFn(event.context.inputText);
                    event.context.disposeOverlay();
                    event.context.inputText = undefined;
                },
                inputCheck: true,
                placeholder: 'Enter correct answer'
            };
            new CustomDialog($q, options);
            return true;
        };
    }

]);
