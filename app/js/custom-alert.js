function CustomDialog($q, options, element) {
    this.customPromise = $q.defer();
    this.options = options;
    this.options.inputCheck = this.options.inputCheck || false;
    this.options.closeHandler = this.options.closeHandler || false;
    this.createOverlay();
}

CustomDialog.prototype.show = function () {
    return this.customPromise.promise;
};

var addInputCheckClass = function (inputCheck, mask) {
    mask.className = inputCheck ? "mask custom-dialog-mask" : "mask custom-dialog-mask no-input";
};

var addOneButtonClass = function (length, mask) {
    if (length === 1) {
        mask.classList.add("ok-only");
    }
};

var getBtnName = function(options,btnName){
    var okBtnIndex = options.buttons.indexOf(btnName);
    var buttonName = okBtnIndex != -1?options.buttonName?options.buttonName[okBtnIndex]:btnName:'';
    return buttonName[0].toUpperCase()+buttonName.substring(1,buttonName.length);
};

var addInnerHtml = function (options, mask) {
    var type = options.plainText?'text':'password';
    var input = options.inputCheck ? '<div class="input-container">' + '<input type="'+type+'" name="input" placeholder="' + options.placeholder + '" class="input"/>' + '</div>' : '';
    var ok = options.buttons.indexOf("ok") != -1 ? '<input type="button" name="button" value="'+getBtnName(options,'ok')+'" class="ok left"/>' : '';
    var cancel = options.buttons.indexOf("cancel") != -1 ? '<input type="button" name="button" value="'+getBtnName(options,'cancel')+'" class="close right"/>' : '';

    mask.innerHTML = '<div class="overlay">' +
            '<div class="wrapper">' +
            '<header>' +
            '<h4 class="title">' + options.title + '</h4>' +
            '</header>' +
            '<section>' +
            '<p class="description">' + options.description + '</p>' +

            input +

            '</section>' +
            '<footer class="clear">' +
            ok + cancel +
            '</footer>' +
            '</div>' +
            '</div>';
};

CustomDialog.prototype.createOverlay = function () {
    var mask = document.createElement("div");
    mask.id = "mask";

    addInputCheckClass(this.options.inputCheck, mask);
    addOneButtonClass(this.options.buttons.length, mask);

    addInnerHtml(this.options, mask);

    document.body.appendChild(mask);
    this.mask = mask;

    this.setDefaultOverlaySettings();
};


CustomDialog.prototype.setDefaultOverlaySettings = function () {
    this.overlay = this.mask.getElementsByClassName("overlay")[0];
    this.input = this.overlay.getElementsByClassName("input")[0];
    this.okButton = this.overlay.getElementsByClassName("ok")[0];
    this.closeButton = this.overlay.getElementsByClassName("close")[0];
    document.body.style.overflow = "hidden";
    this.createOverlayEvents();
};


CustomDialog.prototype.createOverlayEvents = function () {

    var escCode = 27;
    var enterCode = 13;

    var self = this;
    self.inputText = "";

    if (this.input) {
        this.input.focus();
        this.input.addEventListener("keyup", function () {
            self.inputText = this.value;
        });
    }
    if (this.okButton) {
        this.okButton.addEventListener("click", function () {
            self.customPromise.resolve(self.getEvent('ok'));
            if (self.options.callback) {
                self.options.callback(self.getEvent('ok'));
                if (!self.options.closeHandler) {
                    self.disposeOverlay();
                }
            } else {
                self.disposeOverlay();
            }
        });
    }
    document.addEventListener("keyup", function (e) {
        if (e.keyCode === enterCode) {
            if (self.options.callback) {
                self.options.callback(self.getEvent('ok'));
            }
            if (!self.options.closeHandler) {
                self.disposeOverlay();
            }
        }
    });

    if (this.closeButton) {
        this.closeButton.addEventListener("click", function () {
            self.customPromise.reject(self.getEvent('cancel'));
            self.disposeOverlay();
        });
    }
    document.addEventListener("keyup", function (e) {
        if (e.keyCode === escCode) {
            self.disposeOverlay();
        }
    });
};
CustomDialog.prototype.disposeOverlay = function () {
    if (this.mask) {
        this.mask.parentElement.removeChild(this.mask);
    }
    document.body.style.overflow = "auto";
};
CustomDialog.prototype.setContent = function (overlayContent) {
    if (typeof overlayContent === "string") {
        this.overlay.innerHTML = overlayContent;
    } else {
        this.overlay.appendChild(overlayContent);
    }
};
CustomDialog.prototype.setMaskClassName = function (className) {
    this.mask.classList.add(className);
};
CustomDialog.prototype.getEvent = function (type) {
    return {
        type: type,
        result: type === "ok",
        context: this
    }
};
