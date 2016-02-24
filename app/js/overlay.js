function Overlay(element, options) {
    this.options = options;
    if(element) {
        this.element = element;
        this.decorateOverlay();
    } else {
        console.log(2, element)
        this.createOverlay()
    }
}
Overlay.prototype.decorateOverlay = function() {
    this.mask = this.element;
    this.setDefaultOverlaySettings();
}

Overlay.prototype.createOverlay = function() {
    var mask = document.createElement("div");
    mask.className = "mask";
    mask.id = "mask";
    mask.innerHTML = '<div class="overlay"><div class="container"><div class="overlay-container">'+
    '<div class="header"><span class="close">Close</span></div></div><div class="overlay-content"></div></div></div>'
    document.body.appendChild(mask);
    this.mask = mask;

    this.setDefaultOverlaySettings();
}
Overlay.prototype.setDefaultOverlaySettings = function() {
    this.overlay = this.mask.getElementsByClassName("overlay")[0];
    this.overlayContent = this.overlay.getElementsByClassName("overlay-content")[0];
    this.closeButton = this.overlay.getElementsByClassName("close")[0];
    document.body.style.overflow = "hidden";
    this.createOverlayEvents();
}
Overlay.prototype.createOverlayEvents = function() {
    var self = this;

    this.mask.addEventListener("click", function() {
        if(!self.options || !self.options.closeHandler) {
            self.disposeOverlay()
        }
    });
    this.closeButton.addEventListener("click", function() {
        if(!self.options || !self.options.closeHandler) {
            self.disposeOverlay()
        }
    });

    this.overlay.addEventListener("click", function(e) {
        e.stopPropagation();
    });
}
Overlay.prototype.disposeOverlay = function() {
    this.mask.parentElement.removeChild(this.mask);
    document.body.style.overflow = "auto";
}
Overlay.prototype.setContent = function(overlayContent) {
    if(typeof overlayContent === "string") {
        this.overlayContent.innerHTML = overlayContent;
    } else {
        this.overlayContent.appendChild(overlayContent);
    }
}
Overlay.prototype.setMaskClassName = function(className) {
    this.mask.classList.add(className);
}