var fs = require('fs');
var unexpected = require('unexpected');
var expect = unexpected.clone();

var utils = require('../src/utils.js');
var orderedDither = require('../src/orderedDither.js');

describe('utils.bufferToImageData', function () {
    it('should get ImageData from Buffer', function () {
        var buffer = fs.readFileSync(__dirname + '/test.gif');
        var input = utils.bufferToImageData(buffer);
        expect(input.height, 'to be defined');
        expect(input.width, 'to be defined');
        expect(input.data.length, 'to be', 1162240);
        expect(input.data.constructor.name, 'to be', 'Uint8ClampedArray');
    });
});

describe('utils.imageDataToBuffer', function () {
    it('should get Buffer from ImageData', function () {
        var ImageData = require('canvas').ImageData;
        var imageData = new ImageData(10,10);

        var outBuffer = utils.imageDataToBuffer(imageData);
        expect(outBuffer.constructor.name, 'to be', 'Buffer');
    });
});

describe('ordered dither', function () {
    var buffer = fs.readFileSync(__dirname + '/test.gif');
    var input = utils.bufferToImageData(buffer);

    it.skip('should work', function () {
        var output = orderedDither(
            input.data,
            utils.defaultPalette,
            4,
            input.width,
            input.height
        );

        var test = output.slice(0, 33);

        expect(
            test,
            'to be',
            [255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255]
        );
    });

});
