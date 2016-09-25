var DitherJS = require('./ditherjs');

DitherJS.prototype.dither = function dither(target, options) {

    if (typeof target === 'string') {
        this._fromSelector(target, options);
    }

    if (
        typeof target === 'object' &&
        target instanceof window.HTMLImageElement
    ) {
        this._fromImgElement(target, options);
    }

};

DitherJS.prototype._replaceElementWithCtx = function(el) {
    var ctx;
    var canvas = document.createElement('canvas');

    canvas.height = el.clientHeight;
    canvas.width = el.clientWidth;

    el.parentNode.replaceChild(canvas, el);

    canvas.className = el.className;

    if (el.style.visibility === 'hidden') {
        canvas.style.visibility = 'visible';
    }

    ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    return ctx;
};

DitherJS.prototype._fromImgElement = function(el, options) {

    var h = el.clientHeight;
    var w = el.clientWidth;

    var ctx = this._replaceElementWithCtx(el);

    ctx.drawImage(el,0,0,w,h);

    var imageData = ctx.getImageData(0,0,w,h);

    this.ditherImageData(imageData, options);

    ctx.putImageData(imageData,0,0);
};

DitherJS.prototype._fromSelector = function(selector, options) {
    var that = this;
    var elements = document.querySelectorAll(selector);
    var handleOnLoad = function(el) {
        return function () {
            that._fromImgElement(el, options);
        };
    };

    try {
        for (var i=0; i<elements.length; i++) {
            var el = elements[i];
            el.style.visibility = 'hidden';
            el.src = el.src + '?' + Date.now();
            el.onload = handleOnLoad(el);
        }
    } catch (e) {
        console.error(e);
    }
};

module.exports = DitherJS;
