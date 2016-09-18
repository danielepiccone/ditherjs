function bufferToImageData(buffer) {
    var Canvas = require('canvas');
    var Image = Canvas.Image;

    var img = new Image();
    img.src = buffer;

    var canvas = new Canvas(img.width, img.height);
    var ctx = canvas.getContext('2d');

    ctx.drawImage(img,0,0,img.width, img.height);

    return ctx.getImageData(0,0,img.width, img.height);
}

function imageDataToBuffer(imageData) {
    var Canvas = require('canvas');
    var Image = Canvas.Image;

    var canvas = new Canvas(imageData.width, imageData.height);
    var ctx = canvas.getContext('2d');

    ctx.putImageData(imageData, 0, 0);

    return canvas.toBuffer();
}

module.exports = {
    bufferToImageData: bufferToImageData,
    imageDataToBuffer: imageDataToBuffer,
};
