var DitherJS = require('./ditherjs');
var utils = require('./utils.js');

DitherJS.prototype.dither = function dither(buffer, options) {
    if (!(buffer instanceof Buffer)) {
        throw utils.error.TargetNotBuffer;
    }

    var imageData = this._bufferToImageData(buffer);

    this.ditherImageData(imageData, options);

    return this._imageDataToBuffer(imageData);
};

DitherJS.prototype._bufferToImageData = function (buffer) {
    var Canvas = utils.Canvas;
    if (!Canvas) {
        throw utils.errors.CanvasNotPresent;
    }

    var createCanvas = Canvas.createCanvas;

    var img = new Canvas.Image();
    img.src = buffer;

    var canvas = createCanvas(img.width, img.height);
    var ctx = canvas.getContext('2d');

    ctx.drawImage(img, 0, 0, img.width, img.height);

    return ctx.getImageData(0, 0, img.width, img.height);
};

DitherJS.prototype._imageDataToBuffer = function (imageData) {
    var Canvas = utils.Canvas;
    if (!Canvas) {
        throw utils.errors.CanvasNotPresent;
    }

    var createCanvas = Canvas.createCanvas;

    var canvas = createCanvas(imageData.width, imageData.height);
    var ctx = canvas.getContext('2d');
    ctx.putImageData(imageData, 0, 0);

    return canvas.toBuffer();
};

module.exports = DitherJS;
