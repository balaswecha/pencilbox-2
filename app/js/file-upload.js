pencilBoxApp.directive("fileUpload", [function () {
    return {
        scope: {
            onFileLoad: "="
        },
        link: function (scope, element, attributes) {
            element.bind("change", function (changeEvent) {
                var reader = new FileReader();
                reader.onload = function (loadEvent) {
                    var data;
                    try{
                        data = JSON.parse(loadEvent.target.result)
                    }catch(err) {
                        alert("This quiz file has been tampered with.");
                        return;
                    }
                    scope.$apply(function () {
                        scope.onFileLoad(data);
                    });
                };
                var file = changeEvent.target.files[0];
                if(!(/\.bsquiz$/).test(file.name)) {
                    alert("Invalid Quiz File.");
                    return;
                }
                reader.readAsText(file);
            });
        }
    }
}]);
