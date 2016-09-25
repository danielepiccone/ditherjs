var fs = require('fs');
var unexpected = require('unexpected');
var expect = unexpected.clone();

var utils = require('../lib/utils.js');
var noop = function () {};

describe('ditherjs', function () {
    [require('../server.js'),require('../client.js')].forEach(function (DitherJS) {

        it('should expose the dithering algorithms', function () {
            expect(DitherJS.orderedDither, 'to be defined');
            expect(DitherJS.atkinsonDither, 'to be defined');
            expect(DitherJS.errorDiffusionDither, 'to be defined');
        });

        it('should expose the dither() method', function () {
            expect(DitherJS.prototype.dither, 'to be defined');
        });

        describe('constructor', function () {
            var ditherjs = new DitherJS();

            it('should get all the defaults with ', function () {
                expect(ditherjs.options.algorithm, 'to be', 'ordered');
                expect(ditherjs.options.step, 'to be', 1);
                expect(ditherjs.options.className, 'to be', 'dither');
                expect(ditherjs.options.palette, 'to be', utils.defaultPalette);
            });
        });

        describe('ditherImageData', function () {
            var ditherjs = new DitherJS();

            var mockImageData = {
                data: [],
                height: 0,
                width: 0
            };
            mockImageData.data.set = noop;

            it('should accept all the algorithms', function () {
                ['atkinson','diffusion','ordered'].forEach(function (algorithm) {
                    var options = { algorithm: algorithm };
                    ditherjs.ditherImageData(mockImageData, options);
                });
            });

            it('should throw an error for an unknown algorithm', function () {
                var options = { algorithm: 'mo' };
                try {
                    ditherjs.ditherImageData(mockImageData, options);
                } catch (err) {
                    expect(err, 'to be', utils.errors.InvalidAlgorithm);
                }
            });

            it('should mutate the imageData', function () {
                var called = false;
                mockImageData.data.set = function () { called = true;};
                ditherjs.ditherImageData(mockImageData);
                expect(called, 'to be true');
            });
        });

        describe('colorDistance', function () {
            var ditherjs = new DitherJS();
            var fn = ditherjs.colorDistance;

            it('should calculate the euclidean distance between colors', function () {
                expect(fn([1,0,0],[0,0,0]),'to be', 1);
                expect(fn([1,1,0],[1,1,0]),'to be', 0);
                expect(fn([1,0,0],[0,0,1]),'to be', 1.4142135623730951);
            });
        });

        describe('approximateColor', function () {
            var ditherjs = new DitherJS();
            var fn = ditherjs.approximateColor.bind(ditherjs);

            it('approximates the color to the closest one', function () {
                var palette = utils.defaultPalette;
                expect(fn([128,0,0], palette), 'to satisfy', [0,0,0]);
                expect(fn([128,0,128], palette), 'to satisfy', [255,0,255]);
                expect(fn([0,128,128], palette), 'to satisfy', [0,255,255]);
            });
        });
    });

});

describe('ditherjs.server', function() {
    var DitherJS = require('../server.js');

    it('should augment the base class', function () {
        [
            '_bufferToImageData',
            '_imageDataToBuffer'
        ].forEach(function (method) {
            expect(DitherJS.prototype.hasOwnProperty(method), 'to be', true);
        });
    });

    describe('_bufferToImageData', function () {
        var ditherjs = new DitherJS();

        it('should get ImageData from Buffer', function () {
            var buffer = fs.readFileSync(__dirname + '/hsl.jpg');
            var input = ditherjs._bufferToImageData(buffer);
            expect(input.height, 'to be defined');
            expect(input.width, 'to be defined');
            expect(input.data.length, 'to be', 262144);
            expect(input.data.constructor.name, 'to be', 'Uint8ClampedArray');
        });
    });

    describe('_imageDataToBuffer', function () {
        var ditherjs = new DitherJS();

        it('should get Buffer from ImageData', function () {
            var ImageData = require('canvas').ImageData;
            var imageData = new ImageData(10,10);

            var outBuffer = ditherjs._imageDataToBuffer(imageData);
            expect(outBuffer.constructor.name, 'to be', 'Buffer');
        });
    });
});

describe('ditherjs.client', function() {
    var DitherJS = require('../client.js');

    var domino = require('domino');
    global.window = domino.createWindow();
    global.document = window.document;


    it('should augment the base class', function () {
        [
            '_replaceElementWithCtx',
            '_fromImgElement',
            '_fromSelector'
        ].forEach(function (method) {
            expect(DitherJS.prototype.hasOwnProperty(method), 'to be', true);
        });
    });

    describe('dither', function () {
        var ditherjs = new DitherJS();

        it('should call _fromImgElement if the argument is a Node', function () {
            var node = document.createElement('img');
            document.body.appendChild(node);

            var called = false;

            var mockInstance = {
                _fromImgElement: function () { called = true; }
            };

            ditherjs.dither.call(mockInstance, node);
            expect(called, 'to be', true);
        });

        it('should call _fromSelector if the argument is a string', function () {
            var called = false;

            var mockInstance = {
                _fromSelector: function () { called = true; }
            };

            ditherjs.dither.call(mockInstance, '.foo');
            expect(called, 'to be', true);
        });
    });

    describe('_replaceElementWithCtx', function () {
        var ditherjs = new DitherJS();

        var element = document.createElement('img');
        element.className = 'boo dither bar';
        document.body.appendChild(element);

        it('should get the canvas context out of the element', function () {
            // TODO getContext() not implemented in Domino
            try {
                ditherjs._replaceElementWithCtx(element) ;
            } catch (err) {
                expect(err, 'to be defined');
            }
        });
    });

    describe('_fromImgElement', function () {
        var ditherjs = new DitherJS();

        var element = document.createElement('img');
        document.body.appendChild(element);

        it('should get the image, process it and put that in the context', function () {
            var MOCK_DATA = ['panda'];

            ditherjs.ditherImageData = function (data) {
                expect(data, 'to be', MOCK_DATA);
                data.push('mango');
            };

            ditherjs._replaceElementWithCtx = function () {
                return {
                    drawImage: noop,
                    getImageData: function () { return MOCK_DATA; },
                    putImageData: function (data) {
                        return expect(data, 'to satisfy', ['panda','mango']);
                    }
                };
            };

            ditherjs._fromImgElement(element);
        });
    });

    describe('_fromSelector', function () {
        var ditherjs = new DitherJS();

        var element = document.createElement('img');
        element.className = 'mommo';
        document.body.appendChild(element);

        it('should call _fromImgElement on the element', function () {
            var mockDitherCalled = false;
            var mockDither = {
                _fromImgElement: function () { mockDitherCalled = true; }
            };

            ditherjs._fromSelector.call(mockDither,'.mommo');

            element.onload();
            expect(mockDitherCalled, 'to be', true);
        });
    });

});


describe('algorithms', function () {
    var buffer = fs.readFileSync(__dirname + '/hsl.jpg');
    var DitherJS = require('../server.js'); // also ../client
    var ditherjs = new DitherJS();

    describe('ordered dither', function () {
        it('should work', function () {
            var input = ditherjs._bufferToImageData(buffer);

            var output = DitherJS.orderedDither.call(ditherjs, input.data, utils.defaultPalette, 1, input.width, input.height);

            var test = Array.prototype.slice.call(output,0, 128);

            expect(
                test,
                'to satisfy',
                [ 255, 0, 255, 255, 255, 0, 255, 255, 255, 0, 255, 255, 255, 0, 255, 255, 255, 0, 255, 255, 255, 0, 255, 255, 255, 0, 255, 255, 255, 0, 255, 255, 255, 0, 255, 255, 255, 0, 255, 255, 255, 0, 255, 255, 255, 0, 255, 255, 255, 0, 255, 255, 255, 0, 255, 255, 255, 0, 255, 255, 255, 255, 255, 255, 255, 0, 255, 255, 255, 255, 255, 255, 255, 0, 255, 255, 255, 255, 255, 255, 255, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255 ]
            );
        });
    });

    describe('atkinson dither', function () {
        it('should work', function () {
            var input = ditherjs._bufferToImageData(buffer);

            var output = DitherJS.atkinsonDither.call(ditherjs, input.data, utils.defaultPalette, 1, input.width, input.height);

            var test = Array.prototype.slice.call(output,0, 128);

            expect(
                test,
                'to satisfy',
                [ 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 255, 0, 255, 255, 0, 0, 0, 255, 0, 0, 0, 255, 255, 255, 255, 255, 0, 0, 0, 255, 0, 0, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 0, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 0, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255 ]
            );
        });
    });

    describe('error diffusion dither', function () {
        it('should work', function () {
            var input = ditherjs._bufferToImageData(buffer);

            var output = DitherJS.errorDiffusionDither.call(ditherjs, input.data, utils.defaultPalette, 1, input.width, input.height);

            var test = Array.prototype.slice.call(output,0, 128);

            expect(
                test,
                'to satisfy',
                [ 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 255, 255, 255, 255, 0, 0, 0, 255, 255, 0, 255, 255, 255, 255, 255, 255, 0, 0, 0, 255, 255, 255, 255, 255, 0, 0, 0, 255, 255, 255, 255, 255, 0, 0, 0, 255, 255, 255, 255, 255, 0, 0, 0, 255, 255, 255, 255, 255, 0, 0, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 0, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255 ]
            );
        });
    });
});
